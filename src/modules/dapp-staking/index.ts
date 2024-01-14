export { checkIsLimitedProvider, checkIsDappStakingV3 } from 'src/modules/dapp-staking/utils';

export interface StakingData {
  address: string;
  name: string;
  balance: string;
  iconUrl: string;
}
