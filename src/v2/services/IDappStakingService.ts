import { BN } from '@polkadot/util';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, StakerInfo } from '../models/DappsStaking';
import { AccountLedger } from '../models/DappsStaking';
import { SubstrateAccount } from 'src/store/general/state';
import { PayloadWithWeight } from 'src/hooks/helper/claim';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

/**
 * Definition of service used to manage dapps staking.
 */
export interface IDappStakingService {
  /**
   * Gets Total Value Locked (TVL) value.
   */
  getTvl(): Promise<TvlModel>;

  /**
   * Stakes given ammount to contract.
   * @param contractAddress Contract address.
   * @param stakerAddress Staked address.
   * @param amount Amount to stake.
   */
  stake(contractAddress: string, stakerAddress: string, amount: BN): Promise<void>;

  /**
   * Starts unbonding process.
   * @param contractAddress Contract address.
   * @param stakerAddress Staked address.
   * @param amount Amount to stake.
   */
  unbondAndUnstake(contractAddress: string, stakerAddress: string, amount: BN): Promise<void>;

  /**
   * Nomination transfer
   * @param fromContractId Contract address transfer from.
   * @param targetContractId Contract address transfer to.
   * @param address Staked address.
   * @param amount Amount to stake.
   */
  nominationTransfer({
    amount,
    fromContractId,
    targetContractId,
    address,
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
    address: string;
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
   */
  getDapp(contractAddress: string, network: string): Promise<EditDappItem | undefined>;

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

  getTxsToExecuteForClaim(
    batchTxs: PayloadWithWeight[]
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;

  claimAll({
    batchTxs,
    senderAddress,
    substrateAccounts,
    tip,
  }: {
    batchTxs: PayloadWithWeight[];
    senderAddress: string;
    substrateAccounts: SubstrateAccount[];
    tip?: string;
  }): Promise<void>;
}
