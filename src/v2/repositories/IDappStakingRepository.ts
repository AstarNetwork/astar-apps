import { BN } from '@polkadot/util';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { SmartContract, StakerInfo } from '../models/DappsStaking';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { AccountLedger } from '../models/DappsStaking';

/**
 * Definition of repository to access dapps staking pallet.
 */
export interface IDappStakingRepository {
  /**
   * Gets Total Value Locked (TVL) value.
   */
  getTvl(): Promise<BN>;

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
   */
  getDapp(contractAddress: string, network: string): Promise<EditDappItem | undefined>;

  /**
   * Gets dapps staking ledger for a given account.
   * @param accountAddress User account.
   */
  getLedger(accountAddress: string): Promise<AccountLedger>;
}
