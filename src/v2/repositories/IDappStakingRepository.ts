import { BN } from '@polkadot/util';

/**
 * Definition of repository to access dapps staking pallet.
 */
export interface IDappStakRepository {
  /**
   * Gets Total Value Locked (TVL) value.
   */
  getTvl(): Promise<BN>;
}
