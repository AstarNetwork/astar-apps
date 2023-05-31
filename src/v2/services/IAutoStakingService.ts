import { BN } from '@polkadot/util';

/**
 * Definition of service used to manage auto staking.
 */
export interface IAutoStakingService {
  /**
   * Stakes given amount to contract.
   * @param contractAddress Contract address.
   * @param stakerAddress Staked address.
   * @param amount Amount to stake.
   * @param successMessage Message on the success toast.
   */
  stake(
    contractAddress: string,
    stakerAddress: string,
    amount: BN,
    successMessage: string
  ): Promise<void>;
}
