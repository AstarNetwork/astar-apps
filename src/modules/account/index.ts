import { Struct } from '@polkadot/types';
import BN from 'bn.js';

export { fetchNativeBalance } from './utils';

export interface SystemAccount extends Struct {
  data: {
    free: BN;
    reserved: BN;
    miscFrozen: BN;
    feeFrozen: BN;
  };
}
