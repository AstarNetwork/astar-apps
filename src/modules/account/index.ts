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

export enum HistoryTxType {
  Transfer = 'Transfer',
  Xcm = 'XCM',
}

export interface TxHistory {
  hash: string;
  type: HistoryTxType;
  timestamp: number;
  data: any;
}
