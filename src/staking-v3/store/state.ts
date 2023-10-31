import { CombinedDappInfo, ProtocolState } from '../logic';

export interface DappStakingState {
  version: string;
  dapps: CombinedDappInfo[];
  protocolState: ProtocolState | undefined;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
    dapps: [],
    protocolState: undefined,
  };
}

export default state;
