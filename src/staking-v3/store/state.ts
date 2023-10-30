import { Dapp, DappBase, ProtocolState } from '../logic';

export interface DappStakingState {
  version: string;
  dapps: CombinedDappInfo[];
  protocolState: ProtocolState | undefined;
}

export interface CombinedDappInfo {
  basic: DappBase;
  extended?: Dapp;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
    dapps: [],
    protocolState: undefined,
  };
}

export default state;
