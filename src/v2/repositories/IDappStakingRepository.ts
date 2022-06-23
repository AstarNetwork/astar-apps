import { BN } from '@polkadot/util';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';

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
}
