import { Struct } from '@polkadot/types';
import { BN } from '@polkadot/util';

export { fetchNativeBalance, addTxHistories } from 'src/modules/account/utils';

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
  Xvm = 'XVM Transfer',
}

export interface TxHistory {
  hash: string;
  type: HistoryTxType;
  timestamp: number;
  data: any;
}
