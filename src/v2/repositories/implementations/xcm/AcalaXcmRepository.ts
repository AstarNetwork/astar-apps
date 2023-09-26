import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { XcmChain } from 'src/v2/models/XcmModels';
import { Struct } from '@polkadot/types';

export interface TokensAccounts extends Struct {
  readonly free: BN;
  readonly reserved: BN;
  readonly frozen: BN;
}

/**
 * Used to transfer assets from Acala/Karura
 */
export class AcalaXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);

    super(defaultApi, apiFactory, registeredTokens);

    this.astarTokens = {
      SDN: 18,
      ASTR: 2,
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

    const tokenData = this.getTokenData(token);

    const destination = {
      V3: {
        parents: '1',
        interior: {
          X2: [
            {
              Parachain: to.parachainId,
            },
            {
              AccountId32: {
                id: decodeAddress(recipientAddress),
              },
            },
          ],
        },
      },
    };

    const destWeight = { Unlimited: null };

    return await this.buildTxCall(
      from,
      endpoint,
      'xTokens',
      'transfer',
      tokenData,
      amount,
      destination,
      destWeight
    );
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
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, {
          ForeignAsset: this.astarTokens[symbol],
        });
        return bal.free.toString();
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

  private getTokenData(token: Asset) {
    return this.isAstarNativeToken(token)
      ? {
          ForeignAsset: this.astarTokens[token.metadata.symbol],
        }
      : {
          Token: token.originAssetId,
        };
  }
}
