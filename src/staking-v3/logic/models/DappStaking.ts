import { DappInfo, ProtocolState } from './Node';

/**
 * Dapp model containing the basic information so dApps can be displayed on the homepage.
 */
export interface DappBase {
  address: string;
  name: string;
  iconUrl: string;
  mainCategory?: string;
  creationTime: number;
  shortDescription: string;
  url: string;
  imagesUrl: string[];
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
 * Contains info required to stake to a dApp.
 */
export interface DappStakeInfo {
  id: number;
  address: string;
  amount: number;
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
  minStakeAmount: bigint;
  minStakeAmountToken?: number;
  minBalanceAfterStaking: number;
  maxNumberOfStakedContracts: number;
  maxNumberOfContracts: number;
  maxUnlockingChunks: number;
  standardErasPerBuildAndEarnPeriod: number;
  standardErasPerVotingPeriod: number;
  unlockingPeriod: number;
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

export interface EraInfo {
  readonly activeEraLocked?: bigint;
  readonly totalLocked: bigint;
  readonly unlocking: bigint;
  readonly currentStakeAmount: StakeAmount;
  readonly nextStakeAmount?: StakeAmount;
}

export interface ContractStakeAmount {
  readonly staked: StakeAmount;
  readonly stakedFuture?: StakeAmount;
  //tierLabel is not used ATM.
  //tierLabel?: TierLabel;
}
