import { Compact, Enum, Option, Struct, Vec, bool, u128, u16, u32 } from '@polkadot/types';
import { AccountId32 } from '@polkadot/types/interfaces';
import { Codec } from '@polkadot/types/types';

interface PalletDappStakingV3PeriodType extends Enum {
  readonly isVoting: boolean;
  readonly isBuildAndEarn: boolean;
  readonly type: 'Voting' | 'BuildAndEarn';
}

interface PalletDappStakingV3PeriodInfo extends Struct {
  readonly number: Compact<u32>;
  readonly periodType: PalletDappStakingV3PeriodType;
  readonly endingEra: Compact<u32>;
}

interface PalletDappStakingV3DAppState extends Enum {
  readonly isRegistered: boolean;
  readonly isUnregistered: boolean;
  readonly asUnregistered: Compact<u32>;
  readonly type: 'Registered' | 'Unregistered';
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
  readonly state: PalletDappStakingV3DAppState;
  readonly rewardDestination: Option<AccountId32>;
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
  readonly staked: PalletDappStakingV3StakeAmount;
  readonly loyalStaker: bool;
}
