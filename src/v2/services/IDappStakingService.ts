import { BN } from '@polkadot/util';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, StakerInfo } from '../models/DappsStaking';

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
}
