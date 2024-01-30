import {
  CombinedDappInfo,
  DappInfo,
  DappStakeInfo,
  SingularStakingInfo,
  StakeAmount,
  StakerRewards,
} from '../models';

/**
 * @interface IDappStakingService interface for a service containing business logic for dapp staking.
 */
export interface IDappStakingService {
  /**
   * Gets the dapps for the given network.
   * @param network Name of the network to get dapps for.
   * @returns A map containing full dapps info (chain and firebase data) and chain info (only for new dapps not stored in firebase yet).
   */
  getDapps(network: string): Promise<{ fullInfo: CombinedDappInfo[]; chainInfo: DappInfo[] }>;

  /**
   * Invokes claim staker rewards, unstake and unlock calls.
   * @param contractAddress Address of the contract to be staked to.
   * @param amount Staking amount.
   * @param senderAddress Address of the request sender.
   * @param successMessage Message to be displayed on the call success.
   */
  claimUnstakeAndUnlock(
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
   * Invokes calls to claim all rewards and to unstake tokens from unregistered contract.
   * @param senderAddress Address of the request sender.
   * @param contractAddress Address of the contract to be un staked from.
   * @param successMessage Message to be displayed on the call success.
   */
  claimAllAndUnstakeFromUnregistered(
    senderAddress: string,
    contractAddress: string,
    successMessage: string
  ): Promise<void>;

  /**
   * Calculates staker rewards.
   * @param senderAddress Staker address.
   * @returns Staker rewards amount.
   */
  getStakerRewards(senderAddress: string): Promise<StakerRewards>;

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

  /**
   * Calculates staker bonus rewards.
   * @param senderAddress Staker address.
   * @returns Staker bonus rewards amount.
   */
  getBonusRewards(senderAddress: string): Promise<bigint>;

  /**
   * Invokes claim bonus rewards call.
   * @param senderAddress Address of the request sender.
   * @param successMessage Message to be displayed on the call success.
   */
  claimBonusRewards(senderAddress: string, successMessage: string): Promise<void>;

  /**
   * Invokes calls to claim staker bonus rewards calls.
   * @param senderAddress Address of the request sender.
   * @param successMessage Message to be displayed on the call success.
   */
  claimStakerAndBonusRewards(senderAddress: string, successMessage: string): Promise<void>;

  /**
   * Batches and invokes multiple calls
   * 1. Claims staker and bonus rewards if available
   * 2. Locks a given tokens amount
   * 3. Unstakes a given tokens amount from a given dApp (nomination transfer)
   * 4. Stakes a given tokens amount
   * @param senderAddress Staker address.
   * @param amountToLock Tokens to lock
   * @param stakeInfo A map containing contract addresses and amounts to stake.
   * @param dappsToClaim List of dApp owned by sender to claim dApp rewards for.
   * @param unstakeFromAddress Address of the contract to be unstaked from.
   * @param unstakeAmount Amount of tokens to unstake.
   * @param successMessage Message to be displayed on the call success.
   * @returns Staker rewards amount and eras to be rewarded.
   */
  claimLockAndStake(
    senderAddress: string,
    amountToLock: bigint,
    stakeInfo: DappStakeInfo[],
    unstakeFromAddress: string,
    unstakeAmount: bigint,
    successMessage: string
  ): Promise<void>;

  getDappRewardsForPeriod(contractAddress: string, period: number): Promise<[bigint, number]>;

  /**
   * Gets contract stake amounts for a given dApps ids.
   * @param dappIds dApps ids to get stake amounts for.
   * @returns A map containing dApp id and stake amount. If stake amount is undefined, it means that
   *         there is no stakes for the dApp in the current period.
   */
  getContractStakes(dappIds: number[]): Promise<Map<number, StakeAmount | undefined>>;

  /**
   * Claims all fully unlocked tokens.
   * @param senderAddress Address of the request sender.
   */
  claimUnlockedTokens(senderAddress: string, successMessage: string): Promise<void>;

  /**
   * Re locks all unbonding chunks.
   * @param senderAddress Address of the request sender.
   */
  relockUnlockingTokens(senderAddress: string, successMessage: string): Promise<void>;

  unlockTokens(senderAddress: string, amount: number, successMessage: string): Promise<void>;

  getStakerInfo(
    address: string,
    includePreviousPeriods: boolean
  ): Promise<Map<string, SingularStakingInfo>>;

  startAccountLedgerSubscription(address: string): Promise<void>;
}
