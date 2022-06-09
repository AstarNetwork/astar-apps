import { BN } from '@polkadot/util';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { IDappStakingRepository } from 'src/v2/repositories';

export class DappStakingRepositoryMock implements IDappStakingRepository {
  getTvl(): Promise<BN> {
    return Promise.resolve(new BN('100000000000000000000'));
  }

  public async getBondAndStakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    return {} as SubmittableExtrinsic<'promise', ISubmittableResult>;
  }
}
