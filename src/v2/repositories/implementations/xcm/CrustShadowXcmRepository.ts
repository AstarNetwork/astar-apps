import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { XcmChain } from 'src/v2/models/XcmModels';
import { Option, Struct } from '@polkadot/types';
import { getPubkeyFromSS58Addr } from '@astar-network/astar-sdk-core';

interface TokensAccounts extends Struct {
  readonly free: BN;
  readonly reserved: BN;
  readonly frozen: BN;
  readonly balance: BN;
}

interface AssetConfig extends Struct {
  v1: {
    parents: number;
    interior: Interior;
  };
}

interface Interior {
  x2: X2[];
}

interface X2 {
  parachain: number;
  generalKey: string;
}

/**
 * Used to transfer assets from Crust Shadow
 */
export class CrustShadowXcmRepository extends XcmRepository {
  private astarNativeTokenId;

  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);
    super(defaultApi, apiFactory, registeredTokens);
    this.astarNativeTokenId = '0000000000000000000';
    this.astarTokens = {
      SDN: '16797826370226091782818345603793389938',
    };
  }

  public async getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN,
    endpoint: string
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }

    const symbol = token.metadata.symbol;
    const recipientAccountId = getPubkeyFromSS58Addr(recipientAddress);

    const isWithdrawAssets = token.id !== this.astarNativeTokenId;
    const functionName = isWithdrawAssets ? 'reserveTransferAssets' : 'transfer';
    const extrinsicName = isWithdrawAssets ? 'polkadotXcm' : 'xTokens';
    const isSendToParachain = to.parachainId > 0;
    const destination = isSendToParachain
      ? {
          V1: {
            interior: {
              X1: {
                Parachain: new BN(to.parachainId),
              },
            },
            parents: new BN(1),
          },
        }
      : {
          V1: {
            interior: 'Here',
            parents: new BN(1),
          },
        };

    const X1 = {
      AccountId32: {
        network: 'Any',
        id: decodeAddress(recipientAccountId),
      },
    };

    const X2 = isWithdrawAssets
      ? null
      : [
          {
            Parachain: new BN(to.parachainId),
          },
          {
            AccountId32: {
              network: 'Any',
              id: decodeAddress(recipientAccountId),
            },
          },
        ];

    const beneficiary = isWithdrawAssets
      ? {
          V1: {
            interior: {
              X1,
            },
            parents: new BN(0),
          },
        }
      : {
          V1: {
            interior: {
              X2,
            },
            parents: new BN(1),
          },
        };

    const isRegisteredAsset = !isSendToParachain || !isWithdrawAssets;

    const asset = isRegisteredAsset
      ? {
          Concrete: await this.fetchAssetConfig(from, token, endpoint),
        }
      : {
          Concrete: {
            interior: 'Here',
            parents: new BN(isSendToParachain ? 0 : 1),
          },
        };

    const assets = {
      V1: [
        {
          fun: {
            Fungible: new BN(amount),
          },
          id: asset,
        },
      ],
    };

    if (isWithdrawAssets) {
      return await this.buildTxCall(
        from,
        endpoint,
        extrinsicName,
        functionName,
        destination,
        beneficiary,
        assets,
        new BN(0)
      );
    } else {
      const currencyId = {
        OtherReserve: this.astarTokens[symbol],
      };
      const destWeight = new BN(10).pow(new BN(9)).muln(5);
      return await this.buildTxCall(
        from,
        endpoint,
        extrinsicName,
        functionName,
        currencyId,
        amount,
        beneficiary,
        destWeight
      );
    }
  }

  protected async fetchAssetConfig(
    source: XcmChain,
    token: Asset,
    endpoint: string
  ): Promise<{
    parents: number;
    interior: Interior;
  }> {
    const symbol = token.metadata.symbol;
    const api = await this.apiFactory.get(endpoint);
    const config = await api.query.assetManager.assetIdType<Option<AssetConfig>>(
      this.astarTokens[symbol]
    );

    // return config.unwrap().v1;
    const formattedAssetConfig = JSON.parse(config.toString());
    return formattedAssetConfig.xcm;
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string> {
    const symbol = token.metadata.symbol;
    const api = await this.apiFactory.get(endpoint);

    try {
      if (this.isAstarNativeToken(token)) {
        const bal = await api.query.assets.account<Option<TokensAccounts>>(
          this.astarTokens[symbol],
          address
        );
        return bal.unwrap().balance.toString();
      }

      if (isNativeToken) {
        return (await this.getNativeBalance(address, chain, endpoint)).toString();
      } else {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, {
          Token: token.originAssetId,
        });
        return bal.free.toString();
      }
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
