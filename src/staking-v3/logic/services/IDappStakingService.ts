import { CombinedDappInfo } from '../models';

/**
 * @interface IDappStakingService interface for a service containing business logic for dapp staking.
 */
export interface IDappStakingService {
  /**
   * Gets the dapps for the given network.
   */
  getDapps(network: string): Promise<CombinedDappInfo[]>;

  /**
   * Invokes lock and stake calls.
   * @param contractAddress Address of the contract to be staked to.
   * @param amount Staking amount.
   * @param senderAddress Address of the request sender.
   * @param successMessage Message to be displayed on the call success.
   */
  lockAndStake(
    contractAddress: string,
    amount: number,
    senderAddress: string,
    successMessage: string
  ): Promise<void>;
}
