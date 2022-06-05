import { BN } from '@polkadot/util';

/**
 * Definition of repository to access dapps staking pallet.
 */
export interface IDappStakingRepository {
  /**
   * Gets Total Value Locked (TVL) value.
   */
  getTvl(): Promise<BN>;
}
