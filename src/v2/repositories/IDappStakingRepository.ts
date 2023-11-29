import { BN } from '@polkadot/util';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import {
  SmartContract,
  StakerInfo,
  DappStakingConstants,
  AccountLedger,
  RewardDestination,
} from '../models/DappsStaking';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { u32 } from '@polkadot/types';
import { GeneralStakerInfo } from '@astar-network/astar-sdk-core';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { ParamClaimAll } from '../services';

export interface DappAggregatedMetrics {
  name: string;
  url: string;
  metrics: {
    transactions: number;
    transactionsPercentageChange: number;
    uaw: number;
    uawPercentageChange: number;
    volume: number;
    volumePercentageChange: number;
    balance: number;
    balancePercentageChange: number;
  };
}

/**
 * Definition of repository to access dapps staking pallet.
 */
export interface IDappStakingRepository {
  /**
   * Gets Total Value Locked (TVL) value.
   */
  getTvl(): Promise<string>;

  /**
   * Gets bondAndStake call extrisnic.
   */
  getBondAndStakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;

  /**
   * Gets unbondAndUnstale call extrinsic.
   */
  getUnbondAndUnstakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;

  /**
   * Gets nomination transfer call
   */
  getNominationTransferCall({
    amount,
    fromContractId,
    targetContractId,
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
  }): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;

  /**
   * Gets staker info (total staked, stakers count) for a given contracts.
   * @param contractAddresses List of contract addresses to provide info for.
   */
  getStakerInfo(contractAddresses: string[], walletAddress: string): Promise<StakerInfo[]>;

  /**
   * Gets all dapps registered to a node.
   */
  getRegisteredDapps(): Promise<SmartContract[]>;

  /**
   * Starts subscription to a era change.
   */
  starEraSubscription(): Promise<void>;

  fetchAccountStakingAmount(contractAddress: string, walletAddress: string): Promise<string>;

  /** Gets contract address registered by the given developer address */
  getRegisteredContract(developerAddress: string): Promise<string | undefined>;

  /**
   * Gets dapp data from Firebase.
   * @param contractAddress Dapp contract address.
   * @param network Name of the network where dapp has been deployed.
   * @param forEdit Flag to indicate if dapp data should be fetched with encoded images.
   */
  getDapp(
    contractAddress: string,
    network: string,
    forEdit: boolean
  ): Promise<EditDappItem | undefined>;

  /**
   * Gets dapps staking ledger for a given account.
   * @param accountAddress User account.
   */
  getLedger(accountAddress: string): Promise<AccountLedger>;

  /**
   * Gets dapp staking APR and APY values for a given network.
   * @param network Network to fetch values for.
   */
  getApr(network: string): Promise<{ apr: number; apy: number }>;

  getCurrentEra(): Promise<u32>;

  /**
   * Gets dapp staking constants.
   */
  getConstants(): Promise<DappStakingConstants>;

  getGeneralStakerInfo(
    stakerAddress: string,
    contractAddress: string
  ): Promise<Map<string, GeneralStakerInfo>>;

  getNextEraEta(network: string): Promise<number>;

  getStakeInfo(dappAddress: string, currentAccount: string): Promise<StakeInfo | undefined>;
  getSetRewardDestinationCall(
    rewardDestination: RewardDestination
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
  getWithdrawCall(): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;
  getClaimCall(param: ParamClaimAll): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;

  getAggregatedMetrics(network: string): Promise<DappAggregatedMetrics[]>;
}
