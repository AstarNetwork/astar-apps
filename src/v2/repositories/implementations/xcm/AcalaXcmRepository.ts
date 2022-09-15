import { BN } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { XcmTokenInformation } from 'src/modules/xcm';
import { container } from 'src/v2/common';
import { ExtrinsicPayload, IApi, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';
import { XcmRepository } from '../XcmRepository';
import { XcmChain } from 'src/modules/xcm';

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
    amount: BN
  ): Promise<ExtrinsicPayload> {
    if (!to.parachainId) {
      throw `Parachain id for ${to.name} is not defined`;
    }

    const tokenData = this.getTokenData(token);

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

    //Memo: each XCM instruction is weighted to be 1_000_000_000 units of weight and for this op to execute
    //weight value of 5 * 10^9 is generally good
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
