import { BN } from '@polkadot/util';
import { DappItem } from '@astar-network/astar-sdk-core';
import { Guard } from '../common';

export enum SmartContractState {
  Registered = 'Registered',
  Unregistered = 'Unregistered',
}

export class StakerInfo {
  public totalStakeFormatted?: string;

  constructor(
    public contractAddress: string,
    public totalStake: string,
    public stakersCount: number,
    public accountStakingAmount: string
  ) {}

  static createDefault(contractAddress: string): StakerInfo {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);

    return new StakerInfo(contractAddress, '0', 0, '0');
  }
}

export class SmartContract {
  constructor(
    public address: string,
    public developerAddress: string,
    public state: SmartContractState
  ) {}
}

export class DappCombinedInfo {
  constructor(
    public contract: SmartContract,
    public stakerInfo: StakerInfo,
    public dapp?: DappItem
  ) {}
}

export interface ChunkInfo {
  amount: BN;
  unlockEra: BN;
  erasBeforeUnlock: number;
}

export type RewardDestination = 'StakeBalance' | 'FreeBalance';

export interface AccountLedger {
  locked: BN;
  rewardDestination: RewardDestination;
  unbondingInfo: {
    unlockingChunks: ChunkInfo[];
  };
}

export interface DappStakingConstants {
  maxEraStakeValues: number;
}

export interface Campaign {
  name: string;
  shortDescription: string;
  link?: string;
  img: string;
  address?: string;
}
