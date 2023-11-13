import {
  AccountLedger,
  CombinedDappInfo,
  ProtocolState,
  SingularStakingInfo,
  Rewards,
} from '../logic';

export interface DappStakingState {
  version: string;
  dapps: CombinedDappInfo[];
  protocolState: ProtocolState | undefined;
  ledger: AccountLedger | undefined;
  stakerInfo: Map<string, SingularStakingInfo> | undefined;
  rewards: Rewards | undefined;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
    dapps: [],
    protocolState: undefined,
    ledger: undefined,
    stakerInfo: undefined,
    rewards: undefined,
  };
}

export default state;
