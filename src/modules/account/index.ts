import { Struct } from '@polkadot/types';
import { BN } from '@polkadot/util';

export { addTxHistories } from 'src/modules/account/utils';

export interface SystemAccount extends Struct {
  data: {
    free: BN;
    reserved: BN;
    frozen: BN;
    flags: BN;
  };
}

export enum HistoryTxType {
  Transfer = 'Transfer',
  Xcm = 'XCM',
  Xvm = 'XVM Transfer',
  ZK_ETHEREUM_BRIDGE = 'ZK Ethereum Bridge',
}

export interface TxHistory {
  hash: string;
  type: HistoryTxType;
  timestamp: number;
  data: any;
}
