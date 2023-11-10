import { ExtrinsicPayload } from '@astar-network/astar-sdk-core';
import { AccountLedger, Dapp, DappBase, DappInfo, PeriodEndInfo, ProtocolState } from '../models';

/**
 * Interface for repository that handles dapp staking data.
 */
export interface IDappStakingRepository {
  /**
   * Gets dapps data for the given network.
   * @param network The network to get dapp staking data for.
   * @returns A promise that resolves to an array of dapp staking data.
   */
  getDapps(network: string): Promise<DappBase[]>;

  /**
   * Gets dapp data for the given network and dapp address.
   * @param network Network name
   * @param dappAddress dApp address
   * @returns A promise that resolves to a dapp data.
   */
  getDapp(network: string, dappAddress: string): Promise<Dapp>;

  /**
   * Gets protocol state for the given network.
   * @param network The network to get protocol state for.
   */
  getProtocolState(): Promise<ProtocolState>;

  /**
   * Starts subscription to protocol state, so UI gets automatically updated when it changes.
   */
  startProtocolStateSubscription(): Promise<void>;

  /**
   * Gets all dapps within the network.
   */
  getChainDapps(): Promise<DappInfo[]>;

  /**
   * Starts a subscription to an account ledger with the given address.
   * @param address Address to get account ledger for.
   */
  startAccountLedgerSubscription(address: string): Promise<void>;

  /**
   * Gets an account ledger for the given address.
   * @param address Address to get account ledger for.
   * @returns A promise that resolves to an account ledger.
   */
  getAccountLedger(address: string): Promise<AccountLedger>;

  /**
   * Gets tokens lock call. Tokens needs to be locks in order to be staked
   * @param amount Amount of tokens to lock.
   */
  getLockCall(amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets stake call. Tokens needs to be locked in order to be staked.
   * @param contractAddress Address of the contract to be staked to.
   * @param amount Staking amount.
   */
  getStakeCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets batch call made of lock and stake calls.
   * @param contractAddress Address of the contract to be staked to.
   * @param amount Staking amount.
   */
  getLockAndStakeCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets unstake call.
   * @param contractAddress Address of the contract to be unstaked from.
   * @param amount Unstaking amount.
   */
  getUnstakeCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets unlock call.
   * @param amount Amount of tokens to unlock.
   */
  getUnlockCall(amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets batch call made of unstake and unlock calls.
   * @param contractAddress Address of the contract to be staked to.
   * @param amount Staking amount.
   */
  getUnstakeAndUnlockCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets claim staker rewards call.
   */
  getClaimStakerRewardsCall(): Promise<ExtrinsicPayload>;

  /**
   * Starts subscription to a staker info changes.
   * @param address Staker address to get info for.
   * @returns A promise that resolves to a map of staker address and staker info.
   */
  startGetStakerInfoSubscription(address: string): Promise<void>;

  /**
   * Gets period end information (last era, bonus rewards, total stake)
   * @param period Period number to get info for.
   * @returns A promise that resolves to the period info.
   */
  getPeriodEndInfo(period: number): Promise<PeriodEndInfo | undefined>;
}
