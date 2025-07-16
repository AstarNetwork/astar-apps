import { BN } from '@polkadot/util';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { XcmChain } from 'src/v2/models/XcmModels';
import { TokensAccounts } from 'src/v2/repositories/implementations/xcm/AcalaXcmRepository';
import { decodeAddress } from '@polkadot/util-crypto';

// Mapping object for token IDs
const TOKEN_IDS: Record<string, any> = {
  PEN: 'Native',
  'XLM.s': { Stellar: 'StellarNative' },
};

export class PendulumXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);
    super(defaultApi, apiFactory, registeredTokens);
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
    const api = await this.apiFactory.get(endpoint);

    try {
      if (isNativeToken) {
        const nativeBalance = await this.getNativeBalance(address, chain, endpoint);
        return nativeBalance.toString();
      }

      const currencyId = TOKEN_IDS[token.originAssetId];
      if (!currencyId) {
        console.error(`Token name for ${token.originAssetId} is not defined`);
        return '0';
      }
      const bal = await api.query.tokens.accounts<TokensAccounts>(address, currencyId);
      return bal.free.toString();
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
