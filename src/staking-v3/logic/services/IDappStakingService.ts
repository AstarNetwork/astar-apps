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

  /**
   * Invokes unstake and unlock calls.
   * @param contractAddress Address of the contract to be staked to.
   * @param amount Staking amount.
   * @param senderAddress Address of the request sender.
   * @param successMessage Message to be displayed on the call success.
   */
  unstakeAndUnlock(
    contractAddress: string,
    amount: number,
    senderAddress: string,
    successMessage: string
  ): Promise<void>;

  /**
   * Invokes claim staker rewards call.
   * @param senderAddress Address of the request sender.
   * @param successMessage Message to be displayed on the call success.
   */
  claimStakerRewards(senderAddress: string, successMessage: string): Promise<void>;

  /**
   * Calculates staker rewards.
   * @param senderAddress Staker address.
   * @returns Staker rewards amount.
   */
  getStakerRewards(senderAddress: string): Promise<bigint>;

  /**
   * Calculates a dApp rewards
   * @param contractAddress Contract address to calculate reward for.
   * @returns Dapp rewards amount.
   */
  getDappRewards(contractAddress: string): Promise<bigint>;

  /**
   * Invokes claim dapp rewards call.
   * @param contractAddress Address of the contract to be claimed from.
   * @param senderAddress Address of the request sender.
   * @param successMessage Message to be displayed on the call success.
   */
  claimDappRewards(
    contractAddress: string,
    senderAddress: string,
    successMessage: string
  ): Promise<void>;
}
