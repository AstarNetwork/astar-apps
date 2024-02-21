import {
  AccountLedger,
  CombinedDappInfo,
  ProtocolState,
  SingularStakingInfo,
  NumberOfStakersAndLockers,
  Rewards,
  Constants,
  EraInfo,
  DAppTierRewards,
  TiersConfiguration,
  EraLengths,
  DappInfo,
} from '../logic';

export interface DappStakingState {
  version: string;
  dapps: CombinedDappInfo[];
  newDapps: DappInfo[];
  numberOfStakersAndLockers: NumberOfStakersAndLockers;
  protocolState: ProtocolState | undefined;
  ledger: AccountLedger | undefined;
  stakerInfo: Map<string, SingularStakingInfo> | undefined;
  rewards: Rewards | undefined;
  constants: Constants | undefined;
  currentEra: EraInfo | undefined;
  dAppTiers: DAppTierRewards;
  tiersConfiguration: TiersConfiguration;
  eraLengths: EraLengths;
  leaderboard: Map<number, number>;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
    dapps: [],
    newDapps: [],
    numberOfStakersAndLockers: initialNumberOfStakersAndLockers,
    protocolState: undefined,
    ledger: undefined,
    stakerInfo: undefined,
    rewards: undefined,
    constants: undefined,
    currentEra: undefined,
    dAppTiers: initialDappTiersConfiguration,
    tiersConfiguration: initialTiersConfiguration,
    eraLengths: initialEraLengths,
    leaderboard: new Map<number, number>(),
  };
}

export const initialNumberOfStakersAndLockers: NumberOfStakersAndLockers = {
  date: '',
  tvl: '',
  lockersCount: 0,
  tvs: '',
  stakersCount: 0,
};

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

export const initialEraLengths: EraLengths = {
  standardErasPerBuildAndEarnPeriod: 0,
  standardErasPerVotingPeriod: 0,
  standardEraLength: 0,
  periodsPerCycle: 0,
};

export default state;
