import BN from 'bn.js';
export {
  formatStakingList,
  getDappStakers,
  getAddressEnum,
  getStakeInfo,
  getLatestStakePoint,
} from './utils';

export type ContractEvm = {
  Evm: string;
};

export interface StakingData {
  address: string;
  name: string;
  balance: BN;
}
