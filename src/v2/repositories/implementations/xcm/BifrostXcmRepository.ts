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

/**
 * Used to transfer assets from Bifrost
 */
export class BifrostXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);
    super(defaultApi, apiFactory, registeredTokens);
    this.astarTokens = {
      ASTR: 3,
    };
  }

  public async getTransferCall(
    from: XcmChain,
    to: XcmChain,
    recipientAddress: string,
    token: Asset,
    amount: BN
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }
    let tokenData;
    if (token.originAssetId == 'BNC') {
      tokenData = { Native: token.originAssetId };
    } else if (token.originAssetId == '0') {
      tokenData = { VToken2: token.originAssetId };
    } else if (token.originAssetId == 'ASTR') {
      tokenData = { Token2: 3 };
    }
    const destination = {
      V1: {
        parents: '1',
        interior: {
          X2: [
            {
              Parachain: to.parachainId,
            },
            {
              AccountId32: {
                network: {
                  Any: null,
                },
                id: decodeAddress(recipientAddress),
              },
            },
          ],
        },
      },
    };

    const destWeight = new BN(10).pow(new BN(9)).muln(5);
    return await this.buildTxCall(
      from,
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
    isNativeToken: boolean
  ): Promise<string> {
    const api = await this.apiFactory.get(chain.endpoint);
    try {
      if (token.originAssetId == 'BNC') {
        console.log(isNativeToken);
        return (await this.getNativeBalance(address, chain)).toString();
      } else if (token.originAssetId == '0') {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, {
          VToken2: token.originAssetId,
        });
        return bal.free.toString();
      } else {
        const bal = await api.query.tokens.accounts<TokensAccounts>(address, {
          Token2: 3,
        });
        return bal.free.toString();
      }
    } catch (e) {
      console.error(e);
      return '0';
    }
  }
}
