import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from 'src/v2/repositories/implementations/XcmRepository';
import { XcmChain } from 'src/modules/xcm';

/**
 * Used to transfer assets from Acala/Karura
 */
export class StatemintXcmRepository extends XcmRepository {
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
    amount: BN
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }

    const destination = {
      V0: {
        X2: [{ Parent: null }, { Parachain: to.parachainId }],
      },
    };

    const beneficiary = {
      V0: {
        X1: {
          AccountId32: {
            id: decodeAddress(recipientAddress),
            network: {
              Any: null,
            },
          },
        },
      },
    };

    // Ref:
    // https://polkadot.network/blog/xcm-the-cross-consensus-message-format/
    // https://moonriver.polkassembly.network/referendum/85
    const instance = 50;

    const assets = {
      V0: [
        {
          ConcreteFungible: {
            amount: new BN(amount),
            id: {
              X2: [{ PalletInstance: instance }, { GeneralIndex: token.originAssetId }],
            },
          },
        },
      ],
    };

    const feeAssetItem = 0;

    const weightLimit = {
      Unlimited: null,
    };

    return await this.buildTxCall(
      from,
      'polkadotXcm',
      'limitedReserveTransferAssets',
      destination,
      beneficiary,
      assets,
      feeAssetItem,
      weightLimit
    );
  }
}
