export interface DappItem extends LooseObject {
  name: string;
  iconUrl: string;
  description: string;
  url: string;
  address: string;
}

export interface NewDappItem extends DappItem {
  iconFileName: string;
  iconFile: string;
}

export interface DappStateInterface {
  dapps: DappItem[];
  minimumStakingAmount: string;
  maxNumberOfStakersPerContract: number;
  unbondingPeriod: number;
  maxUnlockingChunks: number;
  unlockingChunks: number;
}

export interface LooseObject {
  [key: string]: any;
}

function state(): DappStateInterface {
  return {
    dapps: [],
    minimumStakingAmount: '0',
    maxNumberOfStakersPerContract: 0,
    unbondingPeriod: 0,
    maxUnlockingChunks: 0,
    unlockingChunks: 0,
  };
}

export default state;
