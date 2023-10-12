import { Dapp, DappBase } from '../logic';

export interface DappStakingState {
  version: string;
  dapps: CombinedDappInfo[];
}

export interface CombinedDappInfo {
  basic: DappBase;
  extended?: Dapp;
}

function state(): DappStakingState {
  return {
    version: '3.0.0',
    dapps: [],
  };
}

export default state;
