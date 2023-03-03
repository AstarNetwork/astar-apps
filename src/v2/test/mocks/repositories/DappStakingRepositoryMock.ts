import { BN } from '@polkadot/util';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { injectable } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { DappStakingConstants, SmartContract, StakerInfo } from 'src/v2/models/DappsStaking';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { AccountLedger } from 'src/v2/models/DappsStaking';
import { u32 } from '@polkadot/types';
import { GeneralStakerInfo } from '@astar-network/astar-sdk-core';
import { StakeInfo } from 'src/store/dapp-staking/actions';
@injectable()
export class DappStakingRepositoryMock implements IDappStakingRepository {
  public readonly bondAndStakeCallMock = jest.fn();
  public readonly getRegisteredContractCallMock = jest.fn();
  public readonly nominationTransferMock = jest.fn();
  public readonly currentEraMock = jest.fn();

  constructor() {
    this.bondAndStakeCallMock.mockReset();
    this.getRegisteredContractCallMock.mockReset();
    this.nominationTransferMock.mockReset();
    this.currentEraMock.mockReset();
  }
  getCurrentEra(): Promise<u32> {
    throw new Error('Method not implemented.');
  }
  getConstants(): Promise<DappStakingConstants> {
    throw new Error('Method not implemented.');
  }
  getGeneralStakerInfo(
    stakerAddress: string,
    contractAddress: string
  ): Promise<Map<string, GeneralStakerInfo>> {
    throw new Error('Method not implemented.');
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

  public async getUnbondAndUnstakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    return {} as SubmittableExtrinsic<'promise', ISubmittableResult>;
  }

  public async getNominationTransferCall({
    amount,
    fromContractId,
    targetContractId,
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
  }): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    this.nominationTransferMock.call(this, fromContractId, amount, targetContractId);

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

  public async getDapp(
    contractAddress: string,
    network: string
  ): Promise<EditDappItem | undefined> {
    throw new Error('Not implemented yet');
  }

  public async getLedger(accountAddress: string): Promise<AccountLedger> {
    return {} as AccountLedger;
  }

  public async getApr(network: string): Promise<{ apr: number; apy: number }> {
    return { apr: 0, apy: 0 };
  }

  public async getNextEraEta(network: string): Promise<number> {
    return 0;
  }

  public async getStakeInfo(
    dappAddress: string,
    currentAccount: string
  ): Promise<StakeInfo | undefined> {
    return {} as StakeInfo;
  }
}
