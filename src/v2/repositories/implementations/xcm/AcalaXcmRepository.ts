import { BN } from '@polkadot/util';
import { Chain } from 'src/v2/config/types';
import { ExtrinsicPayload } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { XcmRepositoryBase } from './XcmRepositoryBase';

export class AcalaXcmRepository extends XcmRepositoryBase {
  constructor() {
    super(Chain.Acala);

    console.log('AcalaXcmRepository has been created');
  }

  public async transferToParachain(
    recipientAccountId: string,
    amount: string,
    token: Asset
  ): Promise<ExtrinsicPayload> {
    const dest = {
      V1: {
        parents: '1',
        interior: {
          X2: [
            {
              Parachain: this.endpoint.parachainId,
            },
            {
              AccountId32: {
                network: {
                  Any: null,
                },
                id: this.decodeAddress(recipientAccountId),
              },
            },
          ],
        },
      },
    };

    //Memo: each XCM instruction is weighted to be 1_000_000_000 units of weight and for this op to execute
    //weight value of 5 * 10^9 is generally good
    const destWeight = new BN(10).pow(new BN(9)).muln(5);
    return await this.buildTxCall('xTokens', 'transfer', token, amount, dest, destWeight);
  }
}
