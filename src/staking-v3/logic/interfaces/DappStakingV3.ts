import { Compact, Enum, Struct, bool, u32 } from '@polkadot/types';

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

export interface PalletDappStakingV3ProtocolState extends Struct {
  readonly era: Compact<u32>;
  readonly nextEraStart: Compact<u32>;
  readonly periodInfo: PalletDappStakingV3PeriodInfo;
  readonly maintenance: bool;
}
