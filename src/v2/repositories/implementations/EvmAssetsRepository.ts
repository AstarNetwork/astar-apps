import { injectable } from 'inversify';
import { getTokenBal } from 'src/config/web3';
import { objToArray } from 'src/hooks/helper/common';
import { calUsdAmount } from 'src/hooks/helper/price';
import { Guard } from 'src/v2/common';
import {
  CbridgeToken,
  EvmAsset,
  EvmChain,
  getSelectedToken,
  getTransferConfigs,
} from './../../../c-bridge/index';
import { Erc20Token } from './../../../modules/token/index';
import { getRegisteredERC20Token } from './../../../modules/token/utils/index';
import { IEvmAssetsRepository } from './../IEvmAssetsRepository';

@injectable()
export class EvmAssetsRepository implements IEvmAssetsRepository {
  public async getAssets(
    currentAccount: string,
    srcChainId: number,
    currentNetworkIdx: number,
    isFetchUsd: boolean
  ): Promise<EvmAsset[]> {
    const [cbridgeTokens, registeredTokens] = await Promise.all([
      this.fetchCbridgeAssets({
        currentAccount,
        currentNetworkIdx,
        srcChainId,
        isFetchUsd,
      }),
      this.fetchRegisteredAssets({ currentAccount, srcChainId, isFetchUsd }),
    ]);
    // Todo: unify the data structure later
    return cbridgeTokens.concat(registeredTokens as any);
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
  }): Promise<EvmAsset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

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
          const isDuplicated = seen.has(t.address);
          seen.add(t.address);
          // Memo: Remove the duplicated contract address (ex: PKEX)
          if (isDuplicated) return undefined;

          const { balUsd, userBalance } = await this.updateTokenBalanceHandler({
            userAddress: currentAccount,
            token: t,
            isFetchUsd,
            srcChainId,
          });
          const tokenWithBalance = { ...t, userBalance, userBalanceUsd: String(balUsd) };
          return tokenWithBalance;
        })
    )) as EvmAsset[];

    return tokens.filter((token) => {
      return token !== undefined;
    });
  }

  public async fetchRegisteredAssets({
    currentAccount,
    srcChainId,
    isFetchUsd,
  }: {
    currentAccount: string;
    srcChainId: number;
    isFetchUsd: boolean;
  }): Promise<Erc20Token[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);
    const tokens = getRegisteredERC20Token();
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

  private async updateTokenBalanceHandler({
    userAddress,
    token,
    isFetchUsd,
    srcChainId,
  }: {
    userAddress: string;
    token: EvmAsset;
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
