export { checkIsLimitedProvider } from 'src/modules/dapp-staking/utils';

export { getPendingRewards } from 'src/modules/dapp-staking/pending-rewards';

export interface StakingData {
  address: string;
  name: string;
  balance: string;
  iconUrl: string;
}
