import { AccountLedger, CombinedDappInfo, ProtocolState, SingularStakingInfo } from '../logic';

export interface DappStakingState {
  version: string;
  dapps: CombinedDappInfo[];
  protocolState: ProtocolState | undefined;
  ledger: AccountLedger | undefined;
  stakerInfo: Map<string, SingularStakingInfo> | undefined;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
    dapps: [],
    protocolState: undefined,
    ledger: undefined,
    stakerInfo: undefined,
  };
}

export default state;
