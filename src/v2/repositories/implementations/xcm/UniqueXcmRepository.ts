import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { Asset } from 'src/v2/models';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { XcmChain } from 'src/v2/models/XcmModels';
import { XcmRepository } from 'src/v2/repositories/implementations/XcmRepository';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';

export class UniqueXcmRepository extends XcmRepository {
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
    if (token.id !== '18446744073709551631') {
      throw 'Token must be UNQ';
    }

    const unqCollectionId = 0;

    const destination = {
      V2: {
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

    const destWeight = { Unlimited: null };

    return await this.buildTxCall(
      from,
      endpoint,
      'xTokens',
      'transfer',
      unqCollectionId,
      amount,
      destination,
      destWeight
    );
  }
}
