import type { AccountId32, Perbill, Permill } from '@polkadot/types/interfaces';
import type {
  BTreeMap,
  Compact,
  Enum,
  Option,
  Struct,
  Vec,
  bool,
  u128,
  u16,
  u32,
  u8,
} from '@polkadot/types';
import type { Codec } from '@polkadot/types/types';

interface PalletDappStakingV3PeriodType extends Enum {
  readonly isVoting: boolean;
  readonly isBuildAndEarn: boolean;
  readonly type: 'Voting' | 'BuildAndEarn';
}

interface PalletDappStakingV3TierLabel extends Enum {}

interface PalletDappStakingV3PeriodInfo extends Struct {
  readonly number: Compact<u32>;
  readonly subperiod: PalletDappStakingV3PeriodType;
  readonly nextSubperiodStartEra: Compact<u32>;
}

interface PalletDappStakingV3UnlockingChunk extends Struct {
  readonly amount: Compact<u128>;
  readonly unlockBlock: Compact<u32>;
}

export interface PalletDappStakingV3StakeAmount extends Struct {
  readonly voting: Compact<u128>;
  readonly buildAndEarn: Compact<u128>;
  readonly era: Compact<u32>;
  readonly period: Compact<u32>;
}

export interface PalletDappStakingV3ProtocolState extends Struct {
  readonly era: Compact<u32>;
  readonly nextEraStart: Compact<u32>;
  readonly periodInfo: PalletDappStakingV3PeriodInfo;
  readonly maintenance: bool;
}

export interface PalletDappStakingV3DAppInfo extends Struct {
  readonly owner: AccountId32;
  readonly id: Compact<u16>;
  readonly rewardBeneficiary: Option<AccountId32>;
}

export interface SmartContractAddress extends Struct {
  isEvm: boolean;
  asEvm?: Codec;
  isWasm: boolean;
  asWasm?: Codec;
}

export interface PalletDappStakingV3AccountLedger extends Struct {
  readonly locked: Compact<u128>;
  readonly unlocking: Vec<PalletDappStakingV3UnlockingChunk>;
  readonly staked: PalletDappStakingV3StakeAmount;
  readonly stakedFuture: Option<PalletDappStakingV3StakeAmount>;
  readonly contractStakeCount: Compact<u32>;
}

export interface PalletDappStakingV3StakeAmount extends Struct {
  readonly voting: Compact<u128>;
  readonly buildAndEarn: Compact<u128>;
  readonly era: Compact<u32>;
  readonly period: Compact<u32>;
}

export interface PalletDappStakingV3SingularStakingInfo extends Struct {
  readonly previousStaked: PalletDappStakingV3StakeAmount;
  readonly staked: PalletDappStakingV3StakeAmount;
  readonly bonusStatus: u8;
}

export interface PalletDappStakingV3PeriodEndInfo extends Struct {
  readonly bonusRewardPool: Compact<u128>;
  readonly totalVpStake: Compact<u128>;
  readonly finalEra: Compact<u32>;
}

export interface PalletDappStakingV3EraRewardSpan extends Struct {
  readonly span: Vec<PalletDappStakingV3EraReward>;
  readonly firstEra: Compact<u32>;
  readonly lastEra: Compact<u32>;
}

interface PalletDappStakingV3EraReward extends Struct {
  readonly stakerRewardPool: Compact<u128>;
  readonly staked: Compact<u128>;
  readonly dappRewardPool: Compact<u128>;
}

export interface PalletDappStakingV3DAppTierRewards extends Struct {
  readonly dapps: BTreeMap<Compact<u16>, Compact<u8>>;
  readonly rewards: Vec<u128>;
  readonly period: Compact<u32>;
  readonly rankRewards: Vec<u128>;
}

export interface PalletDappStakingV3EraInfo extends Struct {
  readonly totalLocked: Compact<u128>;
  readonly unlocking: Compact<u128>;
  readonly currentStakeAmount: PalletDappStakingV3StakeAmount;
  readonly nextStakeAmount: PalletDappStakingV3StakeAmount;
}

export interface PalletDappStakingV3ContractStakeAmount extends Struct {
  readonly staked: PalletDappStakingV3StakeAmount;
  readonly stakedFuture: Option<PalletDappStakingV3StakeAmount>;
  readonly tierLabel: Option<PalletDappStakingV3TierLabel>;
}

export interface PalletDappStakingV3TiersConfigurationLegacy extends Struct {
  readonly slotsPerTier: Vec<u16>;
  readonly rewardPortion: Vec<Permill>;
  readonly tierThresholds: Vec<PalletDappStakingV3TierThreshold>;
}

export interface PalletDappStakingV3TiersConfiguration extends Struct {
  readonly slotsPerTier: Vec<u16>;
  readonly rewardPortion: Vec<Perbill>;
  readonly tierThresholds: Vec<u128>;
}

export interface PalletDappStakingV3TierThreshold extends Enum {
  readonly isFixedTvlAmount: boolean;
  readonly asFixedTvlAmount: {
    readonly amount: u128;
  } & Struct;
  readonly isDynamicTvlAmount: boolean;
  readonly asDynamicTvlAmount: {
    readonly amount: u128;
    readonly minimumAmount: u128;
  } & Struct;
  readonly type: 'FixedTvlAmount' | 'DynamicTvlAmount';
}
