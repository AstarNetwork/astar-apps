import { BN } from '@polkadot/util';
import { injectable } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';

@injectable()
export class DappStakingRepositoryMock implements IDappStakingRepository {
  getTvl(): Promise<BN> {
    return Promise.resolve(new BN('100000000000000000000'));
  }
}
