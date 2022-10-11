import { BN } from '@polkadot/util';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { injectable } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { SmartContract, StakerInfo } from 'src/v2/models/DappsStaking';

@injectable()
export class DappStakingRepositoryMock implements IDappStakingRepository {
  public readonly bondAndStakeCallMock = jest.fn();
  public readonly getRegisteredContractCallMock = jest.fn();

  constructor() {
    this.bondAndStakeCallMock.mockReset();
    this.getRegisteredContractCallMock.mockReset();
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

  public async getStakerInfo(contractAddresses: string[]): Promise<StakerInfo[]> {
    return Promise.resolve([]);
  }

  public async getRegisteredDapps(): Promise<SmartContract[]> {
    return Promise.resolve([]);
  }
  public async fetchAccountStakingAmount(
    contractAddress: string,
    walletAddress: string
  ): Promise<string> {
    return Promise.resolve('0');
  }

  public async starEraSubscription(): Promise<void> {}

  public async getRegisteredContract(developerAddress: string): Promise<string | undefined> {
    this.getRegisteredContractCallMock.call(this, developerAddress);
    return '0x1';
  }
}
