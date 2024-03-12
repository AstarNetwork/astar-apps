import { ExtrinsicPayload } from '@astar-network/astar-sdk-core';
import {
  AccountLedger,
  Constants,
  ContractStakeAmount,
  DAppTierRewards,
  Dapp,
  DappBase,
  DappInfo,
  EraInfo,
  EraLengths,
  EraRewardSpan,
  InflationParam,
  PeriodEndInfo,
  ProtocolState,
  SingularStakingInfo,
  TiersConfiguration,
} from '../models';

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
   * Gets dapp info for the given contract address.
   * @param contractAddress Address of the contract to get dapp info for.
   * @returns A promise that resolves to a dapp info.
   */
  getChainDapp(contractAddress: string): Promise<DappInfo | undefined>;

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
  getLockCall(amount: bigint): Promise<ExtrinsicPayload>;

  /**
   * Gets stake call. Tokens needs to be locked in order to be staked.
   * @param contractAddress Address of the contract to be staked to.
   * @param amount Staking amount.
   */
  getStakeCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets unstake call.
   * @param contractAddress Address of the contract to be unstaked from.
   * @param amount Unstaking amount.
   */
  getUnstakeCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload>;

  /**
   * Gets unstake from unregistered contract call.
   * @param contractAddress Address of the contract to be unstaked from.
   */
  getUnstakeFromUnregisteredCall(contractAddress: string): Promise<ExtrinsicPayload>;

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
  getUnstakeAndUnlockCalls(contractAddress: string, amount: number): Promise<ExtrinsicPayload[]>;

  /**
   * Gets claim staker rewards batch call. Situations when multiple claim staker call are required
   * is highly possible.
   * @param numberOfCalls Number of calls to batch
   * @returns Batch call
   */
  getClaimStakerRewardsCalls(numberOfCalls: number): Promise<ExtrinsicPayload[]>;

  /**
   * Gets claim dapp rewards batch call.
   * @param contractAddress Address of the contract to claim rewards for.
   * @param erasToClaim Eras to claim rewards for.
   */
  getClaimDappRewardsCalls(
    contractAddress: string,
    erasToClaim: number[]
  ): Promise<ExtrinsicPayload[]>;

  /**
   * Gets claim staker bonus rewards batch call.
   * @param contractAddress Addresses of the contracts to claim bonus rewards for.
   */
  getClaimBonusRewardsCalls(contractAddresses: string[]): Promise<ExtrinsicPayload[]>;

  /**
   * Gets staker info for the given address.
   * @param address Address to get staker info for.
   * @param includePreviousPeriods Indicates whether to include previous periods info.
   *  Previous period info is needed for bonus rewards calculation.
   * @returns A promise that resolves to an array of staker info.
   */
  getStakerInfo(
    address: string,
    includePreviousPeriods: boolean
  ): Promise<Map<string, SingularStakingInfo>>;

  /**
   * Gets period end information (last era, bonus rewards, total stake)
   * @param period Period number to get info for.
   * @returns A promise that resolves to the period info.
   */
  getPeriodEndInfo(period: number): Promise<PeriodEndInfo | undefined>;

  /**
   * Gets era rewards for the given era.
   * @param spanIndex Index of a span to get rewards for.
   * @returns A promise that resolves to the era rewards or undefined if rewards are not available.
   */
  getEraRewards(spanIndex: number): Promise<EraRewardSpan | undefined>;

  /**
   * Gets the pallet constants.
   * @returns A promise that resolves to the constants.
   */
  getConstants(): Promise<Constants>;

  /**
   * Gets the dapp tiers.
   * @param era Era to get dapp tiers for.
   * @returns A promise that resolves to the dapp tiers.
   */
  getDappTiers(era: number): Promise<DAppTierRewards | undefined>;

  /**
   * Creates a batchAll call for a given calls
   * @param calls Calls to batch.
   * @returns Batch call
   */
  batchAllCalls(calls: ExtrinsicPayload[]): Promise<ExtrinsicPayload>;

  /**
   * Gets the current era information.
   * @returns A promise that resolves to the era info.
   */
  getCurrentEraInfo(): Promise<EraInfo>;

  /**
   * Gets the contract staking info.
   * @param dappId Dapp id to get staking info for.
   */
  getContractStake(dappId: number): Promise<ContractStakeAmount>;

  /**
   * Gets a call to claim all fully unlocked chunks.
   */
  getClaimUnlockedTokensCall(): Promise<ExtrinsicPayload>;

  /**
   * Gets a call to relock all unbonding chunks.
   */
  getRelockUnlockingTokensCall(): Promise<ExtrinsicPayload>;

  getTiersConfiguration(): Promise<TiersConfiguration>;

  getEraLengths(): Promise<EraLengths>;

  getCleanupExpiredEntriesCall(): Promise<ExtrinsicPayload>;

  /**
   * Gets dApps tier assignment map.
   */
  getLeaderboard(): Promise<Map<number, number>>;

  /**
   * Gets a call to the legacy code to support v2 ledger stakers to unlock their funds.
   */
  getUnbondAndUnstakeCall(amount: bigint): Promise<ExtrinsicPayload>;

  /**
   * Gets a call to the legacy code to support v2 ledger stakers to withdraw their funds.
   */
  getWithdrawUnbondedCall(): Promise<ExtrinsicPayload>;
}
