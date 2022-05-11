export {
  formatStakingList,
  getAddressEnum,
  getDappStakers,
  getLatestStakePoint,
  getStakeInfo,
} from './utils';

export type ContractEvm = {
  Evm: string;
};

export interface StakingData {
  address: string;
  name: string;
  balance: string;
}
