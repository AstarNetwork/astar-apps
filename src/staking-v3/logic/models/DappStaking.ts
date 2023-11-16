import { DappInfo, ProtocolState } from './Node';

/**
 * Dapp model containing the basic information so dApps can be displayed on the homepage.
 */
export interface DappBase {
  address: string;
  name: string;
  iconUrl: string;
  mainCategory?: string;
}

/**
 * Full dApp model used to display a dApp details.
 */
export interface Dapp extends DappBase {}

/**
 * Used to notify subscribers about protocol state changes.
 */
export class ProtocolStateChangedMessage {
  constructor(public state: ProtocolState) {}
}

/**
 * Used to notify subscribers about ledger changes.
 */
export class AccountLedgerChangedMessage {
  constructor(public ledger: AccountLedger) {}
}

/**
 * Used to notify subscribers about staker info changes.
 */
export class StakerInfoChangedMessage {
  constructor(public stakerInfo: Map<string, SingularStakingInfo>) {}
}

/**
 * Combines a dApp information from different sources, on chain and storage.
 */
export interface CombinedDappInfo {
  basic: DappBase;
  extended?: Dapp;
  chain: DappInfo;
}

interface UnlockingChunk {
  readonly amount: bigint;
  readonly unlockBlock: bigint;
}

export interface StakeAmount {
  readonly voting: bigint;
  readonly buildAndEarn: bigint;
  readonly era: number;
  readonly period: number;
}

/**
 * Staker account ledger.
 */
export interface AccountLedger {
  readonly locked: bigint;
  readonly unlocking: UnlockingChunk[];
  readonly staked: StakeAmount;
  readonly stakedFuture?: StakeAmount;
  readonly contractStakeCount: number;
}

export interface SingularStakingInfo {
  readonly staked: StakeAmount;
  readonly loyalStaker: boolean;
}

export interface PeriodEndInfo {
  readonly bonusRewardPool: bigint;
  readonly totalVpStake: bigint;
  readonly finalEra: number;
}

export interface EraRewardSpan {
  readonly span: EraReward[];
  readonly firstEra: number;
  readonly lastEra: number;
}

export interface EraReward {
  readonly stakerRewardPool: bigint;
  readonly staked: bigint;
  readonly dappRewardPool: bigint;
}

export interface Constants {
  eraRewardSpanLength: number;
  rewardRetentionInPeriods: number;
  maxNumberOfStakedContracts: number;
}

export interface DAppTierRewards {
  readonly dapps: DAppTier[];
  readonly rewards: bigint[];
  readonly period: number;
}

interface DAppTier {
  readonly dappId: number;
  readonly tierId: number | undefined;
}

export interface Rewards {
  dApp: bigint;
  staker: bigint;
  bonus: bigint;
}
