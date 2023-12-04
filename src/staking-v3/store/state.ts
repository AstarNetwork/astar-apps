import {
  AccountLedger,
  CombinedDappInfo,
  ProtocolState,
  SingularStakingInfo,
  Rewards,
  Constants,
  EraInfo,
  DAppTierRewards,
  TiersConfiguration,
} from '../logic';

export interface DappStakingState {
  version: string;
  dapps: CombinedDappInfo[];
  protocolState: ProtocolState | undefined;
  ledger: AccountLedger | undefined;
  stakerInfo: Map<string, SingularStakingInfo> | undefined;
  rewards: Rewards | undefined;
  constants: Constants | undefined;
  currentEra: EraInfo | undefined;
  dAppTiers: DAppTierRewards;
  tiersConfiguration: TiersConfiguration;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
    dapps: [],
    protocolState: undefined,
    ledger: undefined,
    stakerInfo: undefined,
    rewards: undefined,
    constants: undefined,
    currentEra: undefined,
    dAppTiers: initialDappTiersConfiguration,
    tiersConfiguration: initialTiersConfiguration,
  };
}

export const initialTiersConfiguration: TiersConfiguration = {
  numberOfSlots: 0,
  slotsPerTier: [],
  rewardPortion: [],
  tierThresholds: [],
};

export const initialDappTiersConfiguration: DAppTierRewards = {
  dapps: [],
  rewards: [],
  period: 0,
};

export default state;
