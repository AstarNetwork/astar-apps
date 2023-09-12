import { BlockHash } from '@polkadot/types/interfaces';
import { AccountInfoModel } from 'src/v2/models';

/**
 * Definition of repository to access system pallet.
 */
export interface ISystemRepository {
  getAccountInfo(address: string): Promise<AccountInfoModel>;

  /**
   * Starts subscription to a block change.
   */
  startBlockSubscription(): Promise<void>;

  /**
   * Gets chain id.
   */
  getChainId(): Promise<number>;

  /**
   * Gets block hash by block number.
   * @param blockNumber Block number
   */
  getBlockHash(blockNumber: number): Promise<BlockHash>;
}
