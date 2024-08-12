import {
  Bytes,
  Data,
  Enum,
  Null,
  Option,
  Struct,
  U8aFixed,
  Vec,
  u128,
  u32,
  u8,
} from '@polkadot/types';
import { bool } from '@polkadot/types/primitive';
import { AccountId32 } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';

export interface PalletBalancesBalanceLock extends Struct {
  readonly id: U8aFixed;
  readonly amount: u128;
  readonly reasons: PalletBalancesReasons;
}

export interface PalletBalancesReasons extends Enum {
  readonly isFee: boolean;
  readonly isMisc: boolean;
  readonly isAll: boolean;
  readonly type: 'Fee' | 'Misc' | 'All';
}

export interface PalletVestingVestingInfo extends Struct {
  readonly locked: u128;
  readonly perBlock: u128;
  readonly startingBlock: u32;
}

export interface PalletIdentityRegistration extends Struct {
  readonly judgements: Vec<ITuple<[u32, PalletIdentityJudgement]>>;
  readonly deposit: u128;
  readonly info: PalletIdentityIdentityInfo;
}

export interface PalletIdentityJudgement extends Enum {
  readonly isUnknown: boolean;
  readonly isFeePaid: boolean;
  readonly asFeePaid: u128;
  readonly isReasonable: boolean;
  readonly isKnownGood: boolean;
  readonly isOutOfDate: boolean;
  readonly isLowQuality: boolean;
  readonly isErroneous: boolean;
  readonly type:
    | 'Unknown'
    | 'FeePaid'
    | 'Reasonable'
    | 'KnownGood'
    | 'OutOfDate'
    | 'LowQuality'
    | 'Erroneous';
}

export interface PalletIdentityIdentityInfo extends Struct {
  readonly additional: Vec<ITuple<[Data, Data]>>;
  readonly display: Data;
  readonly legal: Data;
  readonly web: Data;
  readonly riot: Data;
  readonly email: Data;
  readonly pgpFingerprint: Option<U8aFixed>;
  readonly image: Data;
  readonly twitter: Data;
}

export interface PalletAssetsAssetAccount extends Struct {
  readonly balance: u128;
  readonly status: PalletAssetsAccountStatus;
  readonly reason: PalletAssetsExistenceReason;
  readonly extra: Null;
}

interface PalletAssetsAccountStatus extends Enum {
  readonly isLiquid: boolean;
  readonly isFrozen: boolean;
  readonly isBlocked: boolean;
  readonly type: 'Liquid' | 'Frozen' | 'Blocked';
}

/** @name PalletAssetsExistenceReason (417) */
interface PalletAssetsExistenceReason extends Enum {
  readonly isConsumer: boolean;
  readonly isSufficient: boolean;
  readonly isDepositHeld: boolean;
  readonly asDepositHeld: u128;
  readonly isDepositRefunded: boolean;
  readonly isDepositFrom: boolean;
  readonly asDepositFrom: ITuple<[AccountId32, u128]>;
  readonly type: 'Consumer' | 'Sufficient' | 'DepositHeld' | 'DepositRefunded' | 'DepositFrom';
}

export interface PalletAssetsAssetMetadata extends Struct {
  readonly deposit: u128;
  readonly name: Bytes;
  readonly symbol: Bytes;
  readonly decimals: u8;
  readonly isFrozen: bool;
}
