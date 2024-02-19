import { DappInfo, DappState, ProtocolState } from './Node';
import { Community } from '@astar-network/astar-sdk-core';

/**
 * Dapp model containing the basic information so dApps can be displayed on the homepage.
 */
export interface DappBase {
  address: string;
  name: string;
  description: string;
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
export interface Dapp extends DappBase {
  tags: string[];
  developers: Developer[];
  communities: Community[];
  contractType: string;
  license: string;
}

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
  dappDetails?: ProviderDappData;
}

export interface Developer {
  githubAccountUrl: string;
  twitterAccountUrl: string;
  linkedInAccountUrl: string;
  iconFile: string;
  name: string;
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
  readonly totalStake: bigint;
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
  unlockingPeriod: number;
}

export interface EraLengths {
  standardErasPerBuildAndEarnPeriod: number;
  standardErasPerVotingPeriod: number;
  standardEraLength: number;
  periodsPerCycle: number;
}

export interface DAppTierRewards {
  readonly dapps: DAppTier[];
  readonly rewards: bigint[];
  readonly period: number;
}

export interface DAppTier {
  readonly dappId: number;
  readonly tierId: number | undefined;
}

export interface Rewards {
  dApp: bigint;
  staker: StakerRewards;
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

export interface TiersConfiguration {
  readonly numberOfSlots: number;
  readonly slotsPerTier: number[];
  readonly rewardPortion: number[];
  readonly tierThresholds: TierThreshold[];
}

interface TierThreshold {
  readonly amount: BigInt;
  readonly minimumAmount?: BigInt;
  readonly type: TvlAmountType;
}

export interface InflationParam {
  readonly maxInflationRate: string;
  readonly adjustableStakersPart: string;
  readonly baseStakersPart: string;
  readonly idealStakingRate: string;
}

export enum TvlAmountType {
  FixedTvlAmount,
  DynamicTvlAmount,
}

export interface ProviderDappData {
  contractAddress: string;
  stakersCount: number;
  registeredAt: number;
  registrationBlockNumber: number;
  unregisteredAt?: number;
  unregistrationBlockNumber?: number;
  owner: string;
  beneficiary?: string;
  state: DappState;
  dappId: number;
}

export interface NumberOfStakersAndLockers {
  date: string;
  tvl: string;
  lockersCount: number;
  tvs: string;
  stakersCount: number;
}

export interface StakerRewards {
  amount: bigint;
  period: number;
  eraCount: number;
}
