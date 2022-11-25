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
}
