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

export interface PalletInflationInflationParameters extends Struct {
  readonly maxInflationRate: Compact<Perquintill>;
  readonly treasuryPart: Compact<Perquintill>;
  readonly collatorsPart: Compact<Perquintill>;
  readonly dappsPart: Compact<Perquintill>;
  readonly baseStakersPart: Compact<Perquintill>;
  readonly adjustableStakersPart: Compact<Perquintill>;
  readonly bonusPart: Compact<Perquintill>;
  readonly idealStakingRate: Compact<Perquintill>;
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
