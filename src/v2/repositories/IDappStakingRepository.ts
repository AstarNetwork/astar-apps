import { BN } from '@polkadot/util';
import { Codec, ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
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
   * Gets bondAndStake call
   */
  getBondAndStakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>>;

  /**
   * Gets dapps staking ledger for a given account.
   * @param accountAddress User account.
   */
  getLedger(accountAddress: string): Promise<AccountLedger>;
}
