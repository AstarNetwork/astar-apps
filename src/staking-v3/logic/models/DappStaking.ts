import { SocialIcon } from '@astar-network/astar-ui';
import { DappInfo, DappState, ProtocolState } from './Node';
import { Community, DappItem } from '@astar-network/astar-sdk-core';

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
  amount: bigint;
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
  readonly previousStaked: StakeAmount;
  readonly loyalStaker: boolean;
  readonly bonusStatus: number;
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
  maxBonusSafeMovesPerPeriod: number;
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
  readonly rankRewards: bigint[];
}

export interface DAppTier {
  readonly dappId: number;
  readonly tierId: number;
  readonly rank: number;
}

export interface Rewards {
  dApp: bigint;
  staker: StakerRewards;
  bonus: bigint;
}

export interface EraInfo {
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
  readonly tierThresholds: bigint[];
}

export interface InflationParam {
  readonly maxInflationRate: number;
  readonly treasuryPart: number;
  readonly collatorsPart: number;
  readonly dappsPart: number;
  readonly baseStakersPart: number;
  readonly adjustableStakersPart: number;
  readonly bonusPart: number;
  readonly idealStakingRate: number;
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

export type BonusRewards = {
  amount: bigint;
  contractsToClaim: Map<string, bigint>;
};

export type DappVote = {
  name: string;
  address: string;
  logoUrl: string;
  amount: number;
  id: number;
  mainCategory?: string;
  stakeAmount?: bigint;
};

export const mapToDappVote = (dapp: CombinedDappInfo): DappVote => ({
  name: dapp.basic.name,
  address: dapp.chain.address,
  logoUrl: dapp.basic.iconUrl,
  amount: 0,
  id: dapp.chain.id,
  mainCategory: dapp.basic.mainCategory,
  stakeAmount: dapp.chain.totalStake,
});

export type DappRegistrationParameters = {
  dapp: NewDappItem;
  senderAddress: string;
  signature: string;
  network: string;
};

export interface NewDappItem extends DappItem {
  iconFileName: string;
  iconFile: string;
  icon: File;
  images: File[];
  imagesContent: string[];
  videoUrlInput: string;
}

export interface EditDappItem extends DappItem {
  iconFile: FileInfo;
  images: FileInfo[];
}

export type FileInfo = {
  name: string;
  base64content: string;
  contentType: string;
};

export interface CommunityDefinition extends Community {
  iconName: SocialIcon;
  label: string;
  validateHandle?: (v: string) => boolean | string;
}

export enum ClaimType {
  Staker,
  Bonus,
  Both,
}
