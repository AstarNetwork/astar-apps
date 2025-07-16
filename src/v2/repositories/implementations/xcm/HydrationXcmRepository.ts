import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { XcmChain } from 'src/v2/models/XcmModels';
import { TokensAccounts } from 'src/v2/repositories/implementations/xcm/AcalaXcmRepository';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';

// Mapping object for token IDs
const TOKEN_IDS: Record<string, { id: number }> = {
  HDX: { id: 0 },
  ASTR: { id: 9 },
};

export class HydrationXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);
    super(defaultApi, apiFactory, registeredTokens);
    this.astarTokens = {
      ASTR: 9,
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

    const tokenData = TOKEN_IDS[token.originAssetId];
    if (!tokenData) {
      throw `Token name for ${token.originAssetId} is not defined`;
    }

    const AccountId32 = {
      id: decodeAddress(recipientAddress),
    };

    const destination = {
      [this.xcmVersion]: {
        parents: '1',
        interior: {
          X2: [
            {
              Parachain: to.parachainId,
            },
            {
              AccountId32,
            },
          ],
        },
      },
    };

    const destWeight = {
      Unlimited: null,
    };

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
    const api = await this.apiFactory.get(endpoint);
    try {
      if (token.originAssetId == 'HDX') {
        return (await this.getNativeBalance(address, chain, endpoint)).toString();
      } else {
        const tokenData = TOKEN_IDS[token.originAssetId];
        if (!tokenData) {
          return '0';
        }

        const bal = await api.query.tokens.accounts<TokensAccounts>(address, tokenData);
        return bal.free.toString();
      }
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
