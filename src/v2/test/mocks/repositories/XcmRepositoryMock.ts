import { BN } from '@polkadot/util';
import { injectable } from 'inversify';
import { Asset, AssetMetadata } from 'src/v2/models';
import { IXcmRepository } from 'src/v2/repositories';

@injectable()
export class XcmRepositoryMock implements IXcmRepository {
  public async getAssets(currentAccount: string): Promise<Asset[]> {
    const result: Asset[] = [];
    result.push(
      new Asset(
        '1',
        '0x111111',
        new AssetMetadata('Astar', 'ASTR', 6, false, new BN('10000000000000000000')),
        '0.1',
        'Shiden',
        '11',
        'image',
        true,
        true
      )
    );

    result[0].balance = new BN('1000');

    return result;
  }
}
