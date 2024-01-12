export type PeriodNumber = number;
export type EraNumber = number;
export type BlockNumber = number;

export enum PeriodType {
  Voting = 'Voting',
  BuildAndEarn = 'BuildAndEarn',
}

export enum DappState {
  Registered = 'Registered',
  Unregistered = 'Unregistered',
}

export interface PeriodInfo {
  number: PeriodNumber;
  subperiod: PeriodType;
  nextSubperiodStartEra: EraNumber;
}

// General information & state of the dApp staking protocol.
export interface ProtocolState {
  // Ongoing era number.
  era: EraNumber;
  // Block number at which the next era should start.
  nextEraStart: BlockNumber;
  // Ongoing period type and when is it expected to end.
  periodInfo: PeriodInfo;
  // `true` if pallet is in maintenance mode (disabled), `false` otherwise.
  maintenance: boolean;
}

export interface DappInfo {
  address: string;
  owner: string;
  id: number;
  state: DappState;
  rewardDestination?: string;
  stakeVoting?: bigint;
  stakeBuildAndEarn?: bigint;
  totalStake?: bigint;
}
