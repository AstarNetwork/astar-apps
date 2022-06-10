import { BN } from '@polkadot/util';
import { IDappStakingRepository } from 'src/v2/repositories';

export class DappStakingRepositoryMock implements IDappStakingRepository {
  getTvl(): Promise<BN> {
    return Promise.resolve(new BN('100000000000000000000'));
  }
}
