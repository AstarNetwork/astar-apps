import { Compact, Struct, u128 } from '@polkadot/types';
import { Perquintill } from '@polkadot/types/interfaces';

export interface PalletInflationActiveInflationConfig extends Struct {
  readonly issuanceSafetyCap: Compact<u128>;
  readonly collatorRewardPerBlock: Compact<u128>;
  readonly treasuryRewardPerBlock: Compact<u128>;
  readonly dappRewardPoolPerEra: Compact<u128>;
  readonly baseStakerRewardPoolPerEra: Compact<u128>;
  readonly adjustableStakerRewardPoolPerEra: Compact<u128>;
  readonly bonusRewardPoolPerPeriod: Compact<u128>;
  readonly idealStakingRate: Perquintill;
}

export interface PalletInflationInflationParams extends Struct {
  readonly maxInflationRate: String;
  readonly adjustableStakersPart: String;
  readonly baseStakersPart: String;
  readonly idealStakingRate: String;
}

export interface InflationConfiguration {
  issuanceSafetyCap: bigint;
  collatorRewardPerBlock: bigint;
  treasuryRewardPerBlock: bigint;
  dappRewardPoolPerEra: bigint;
  baseStakerRewardPoolPerEra: bigint;
  adjustableStakerRewardPoolPerEra: bigint;
  bonusRewardPoolPerPeriod: bigint;
  idealStakingRate: number;
}
