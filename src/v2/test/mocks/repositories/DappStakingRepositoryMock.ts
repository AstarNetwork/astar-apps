import { BN } from '@polkadot/util';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { injectable } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { AccountLedger } from 'src/v2/models/DappsStaking';

@injectable()
export class DappStakingRepositoryMock implements IDappStakingRepository {
  public readonly bondAndStakeCallMock = jest.fn();

  constructor() {
    this.bondAndStakeCallMock.mockReset();
  }

  getTvl(): Promise<BN> {
    return Promise.resolve(new BN('100000000000000000000'));
  }

  public async getBondAndStakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    this.bondAndStakeCallMock.call(this, contractAddress, amount);

    return {} as SubmittableExtrinsic<'promise', ISubmittableResult>;
  }

  public async getLedger(accountAddress: string): Promise<AccountLedger> {
    return {} as AccountLedger;
  }
}
