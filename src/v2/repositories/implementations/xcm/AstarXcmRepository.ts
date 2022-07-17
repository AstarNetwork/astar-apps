import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { getPubkeyFromSS58Addr } from 'src/hooks/helper/addressUtils';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { Network } from 'src/v2/config/types';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';

/**
 * Used to transfer assets from Astar/Shiden.
 */
export class AstarXcmRepository extends XcmRepository {
  constructor() {
    const defaultApi = container.get<IApi>(Symbols.DefaultApi);
    const apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
    const registeredTokens = container.get<XcmTokenInformation[]>(Symbols.RegisteredTokens);

    super(defaultApi, apiFactory, registeredTokens);
    console.log('AstarXcmRepository has been created');
  }

  public async getTransferCall(
    from: Network,
    to: Network,
    recipientAddress: string,
    token: Asset,
    amount: BN
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.displayName} is not defined`;
    }

    const recipientAccountId = getPubkeyFromSS58Addr(recipientAddress);

    // the target parachain connected to the current relaychain
    const destination = {
      V1: {
        interior: {
          X1: {
            Parachain: new BN(to.parachainId),
          },
        },
        parents: new BN(1),
      },
    };
    // the account ID within the destination parachain
    const beneficiary = {
      V1: {
        interior: {
          X1: {
            AccountId32: {
              network: 'Any',
              id: decodeAddress(recipientAccountId),
            },
          },
        },
        parents: new BN(0),
      },
    };
    // amount of fungible tokens to be transferred
    const assets = {
      V1: [
        {
          fun: {
            Fungible: amount,
          },
          id: {
            Concrete: await this.fetchAssetConfig(from, token),
          },
        },
      ],
    };

    return await this.buildTxCall(
      from,
      'polkadotXcm',
      'reserveWithdrawAssets',
      destination,
      beneficiary,
      assets,
      new BN(0)
    );
  }
}
