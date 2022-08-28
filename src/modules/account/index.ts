import { Struct } from '@polkadot/types';
import BN from 'bn.js';

export { fetchNativeBalance, addTxHistories } from './utils';

export interface SystemAccount extends Struct {
  data: {
    free: BN;
    reserved: BN;
    miscFrozen: BN;
    feeFrozen: BN;
  };
}

export interface TxHistory {
  hash: string;
  type: string;
}
