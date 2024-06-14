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

/**
 * Used to transfer assets from Pendulum
 */

const PEN = 'Native';

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
    if (token.id !== '18446744073709551634') {
      throw 'Token must be PEN';
    }
    let tokenData = PEN;
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
    const api = await this.apiFactory.get(endpoint);

    try {
      // PEN
      if (token.originAssetId == '0') {
        return (await this.getNativeBalance(address, chain, endpoint)).toString();
      } else {
        let asset_id = token.originAssetId;
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, asset_id);
        return bal.free.toString();
      }
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
