import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, RewardDestination, StakerInfo } from '../models/DappsStaking';
import { AccountLedger } from '../models/DappsStaking';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { PayloadWithWeight } from '@astar-network/astar-sdk-core';

/**
 * Definition of service used to manage dapps staking.
 */
export interface IDappStakingService {
  /**
   * Gets Total Value Locked (TVL) value.
   */
  getTvl(): Promise<TvlModel>;

  /**
   * Stakes given amount to contract.
   * @param contractAddress Contract address.
   * @param stakerAddress Staked address.
   * @param amount Amount to stake.
   * @param successMessage Message on the success toast.
   * @param successMessage Message on the success toast.
   * @param failureMessage Message on the failed toast.
   */
  stake(
    contractAddress: string,
    stakerAddress: string,
    amount: BN,
    successMessage: string,
    failureMessage?: string
  ): Promise<void>;

  /**
   * Starts unbonding process.
   * @param contractAddress Contract address.
   * @param stakerAddress Staked address.
   * @param amount Amount to stake.
   * @param successMessage Message on the success toast.
   */
  unbondAndUnstake(
    contractAddress: string,
    stakerAddress: string,
    amount: BN,
    successMessage: string
  ): Promise<void>;

  /**
   * Nomination transfer
   * @param fromContractId Contract address transfer from.
   * @param targetContractId Contract address transfer to.
   * @param address Staked address.
   * @param amount Amount to stake.
   * @param successMessage Message on the success toast.
   * @param failureMessage Message on the failed toast.
   */
  nominationTransfer({
    amount,
    fromContractId,
    targetContractId,
    address,
    successMessage,
    failureMessage,
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
    address: string;
    successMessage: string;
    failureMessage?: string;
  }): Promise<void>;

  /**
   * Gets staker info (total staked, stakers count) for a given contracts.
   * @param contractAddresses List of contract addresses to provide info for.
   */
  getStakerInfo(contractAddresses: string[], walletAddress: string): Promise<StakerInfo[]>;

  /**
   * Gets dapps info combined from different sources.
   */
  getCombinedInfo(currentAccount: string): Promise<DappCombinedInfo[]>;

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
    forEdit?: boolean
  ): Promise<EditDappItem | undefined>;

  /**
   * Gets dapps staking ledger for a given account.
   * @param accountAddress User account.
   */
  getLedger(accountAddress: string): Promise<AccountLedger>;

  /**
   * Gets the value indicating whether use will be able to execute claim all batch without errors.
   * @param accountAddress User account address
   */
  canClaimRewardWithoutErrors(accountAddress: string): Promise<boolean>;

  /**
   * claim dApp staking rewards
   */
  sendTx({
    senderAddress,
    transaction,
    finalizedCallback,
  }: {
    senderAddress: string;
    transaction: SubmittableExtrinsic<'promise'>;
    finalizedCallback: (result: ISubmittableResult) => void;
  }): Promise<void>;

  getStakeInfo(dappAddress: string, currentAccount: string): Promise<StakeInfo | undefined>;

  // Memo: set re-stake to turn it On/Off
  setRewardDestination(param: ParamSetRewardDestination): Promise<void>;
  withdraw(param: ParamWithdraw): Promise<void>;
  claimAll(param: ParamClaimAll): Promise<void>;
}

export interface ParamSetRewardDestination {
  rewardDestination: RewardDestination;
  senderAddress: string;
  successMessage: string;
}

export interface ParamWithdraw {
  senderAddress: string;
  finalizedCallback?: (result: ISubmittableResult) => void;
}

export interface ParamClaimAll {
  batchTxs: PayloadWithWeight[];
  maxBatchWeight: BN;
  senderAddress: string;
  transferableBalance: number;
  invalidBalanceMsg: string;
  h160SenderAddress: string;
  finalizedCallback?: (result: ISubmittableResult) => void;
}
