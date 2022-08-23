export {
  formatStakingList,
  getAddressEnum,
  getDappStakers,
  getLatestStakePoint,
  getStakeInfo,
  checkIsLimitedProvider,
} from './utils';

export type ContractEvm = {
  Evm: string;
};

export interface StakingData {
  address: string;
  name: string;
  balance: string;
}
