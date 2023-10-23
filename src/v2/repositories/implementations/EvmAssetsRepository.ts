import { injectable } from 'inversify';
import {
  castCbridgeTokenData,
  CbridgeToken,
  EvmChain,
  getSelectedToken,
  getTransferConfigs,
} from 'src/c-bridge';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { getTokenBal } from 'src/config/web3';
import { objToArray, calUsdAmount } from '@astar-network/astar-sdk-core';
import { Erc20Token } from 'src/modules/token/index';
import { castCbridgeToErc20, getRegisteredERC20Token } from 'src/modules/token/utils/index';
import { container, Guard } from 'src/v2/common';
import { Asset } from 'src/v2/models';
import { IEvmAssetsRepository } from 'src/v2/repositories/IEvmAssetsRepository';
import { IXcmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class EvmAssetsRepository implements IEvmAssetsRepository {
  public async getAssets(
    currentAccount: string,
    srcChainId: number,
    currentNetworkIdx: number,
    isFetchUsd: boolean
  ): Promise<Erc20Token[]> {
    const xcmServiceContainer = container.get<IXcmService>(Symbols.XcmService);
    const xcmAsset = await xcmServiceContainer.getAssets(currentAccount, false);
    const [cbridgeTokens, registeredTokens] = await Promise.all([
      this.fetchCbridgeAssets({
        currentAccount,
        currentNetworkIdx,
        srcChainId,
        isFetchUsd,
      }),
      this.fetchRegisteredAssets({
        currentAccount,
        srcChainId,
        isFetchUsd,
        network: currentNetworkIdx,
        assets: xcmAsset.assets,
      }),
    ]);
    return cbridgeTokens.concat(registeredTokens);
  }
  public async fetchCbridgeAssets({
    currentAccount,
    srcChainId,
    currentNetworkIdx,
    isFetchUsd,
  }: {
    currentAccount: string;
    srcChainId: number;
    currentNetworkIdx: number;
    isFetchUsd: boolean;
  }): Promise<Erc20Token[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    if (
      String(srcChainId) === providerEndpoints[endpointKey.SHIBUYA].evmChainId ||
      String(srcChainId) === providerEndpoints[endpointKey.ROCSTAR].evmChainId ||
      String(srcChainId) === providerEndpoints[endpointKey.ASTAR_ZKEVM].evmChainId ||
      String(srcChainId) === providerEndpoints[endpointKey.ZKATANA].evmChainId ||
      String(srcChainId) === providerEndpoints[endpointKey.LOCAL].evmChainId
    ) {
      return [];
    }

    const data = await getTransferConfigs(currentNetworkIdx);
    if (!data || !data.tokens) {
      throw Error('Cannot fetch from cBridge API');
    }
    const seen = new Set();
    // Todo: use srcChain and destChainID to re-define token information for bridging (ex: PKEX)

    const tokens = (await Promise.all(
      objToArray(data.tokens[srcChainId as EvmChain])
        .flat()
        .map(async (token: CbridgeToken) => {
          const t = getSelectedToken({ srcChainId, token });
          if (!t) return undefined;
          const formattedToken = castCbridgeToErc20({ srcChainId, token: t });
          const isDuplicated = seen.has(formattedToken.address);
          seen.add(formattedToken.address);
          // Memo: Remove the duplicated contract address (ex: PKEX)
          if (isDuplicated) return undefined;

          const { balUsd, userBalance } = await this.updateTokenBalanceHandler({
            userAddress: currentAccount,
            token: formattedToken,
            isFetchUsd,
            srcChainId,
          });
          const tokenWithBalance = {
            ...formattedToken,
            userBalance,
            userBalanceUsd: String(balUsd),
          };
          return castCbridgeTokenData(tokenWithBalance);
        })
    )) as Erc20Token[];

    return tokens.filter((token) => {
      return token !== undefined;
    });
  }

  public async fetchRegisteredAssets({
    currentAccount,
    srcChainId,
    isFetchUsd,
    network,
    assets,
  }: {
    currentAccount: string;
    srcChainId: number;
    isFetchUsd: boolean;
    network: endpointKey;
    assets: Asset[];
  }): Promise<Erc20Token[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);
    const tokens = getRegisteredERC20Token({ network, assets });
    const registeredTokens = await Promise.all(
      tokens.map(async (token: Erc20Token) => {
        if (token.srcChainId === srcChainId) {
          const { balUsd, userBalance } = await this.updateTokenBalanceHandler({
            userAddress: currentAccount,
            token,
            isFetchUsd,
            srcChainId,
          });
          const tokenWithBalance = {
            ...token,
            icon: token.image,
            userBalance,
            userBalanceUsd: String(balUsd),
          };
          return tokenWithBalance;
        } else {
          return undefined;
        }
      })
    );
    return registeredTokens.filter((it) => it !== undefined) as Erc20Token[];
  }

  public async updateTokenBalanceHandler({
    userAddress,
    token,
    isFetchUsd,
    srcChainId,
  }: {
    userAddress: string;
    token: Erc20Token;
    isFetchUsd: Boolean;
    srcChainId: EvmChain;
  }): Promise<{
    balUsd: number;
    userBalance: string;
  }> {
    let balUsd = 0;

    const userBalance = await getTokenBal({
      srcChainId,
      address: userAddress,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
    });
    if (Number(userBalance) > 0 && isFetchUsd) {
      try {
        balUsd = await calUsdAmount({
          amount: Number(userBalance),
          symbol: token.symbol,
        });
      } catch (error) {
        console.error(error);
        balUsd = 0;
      }
    }
    return { balUsd, userBalance };
  }
}
