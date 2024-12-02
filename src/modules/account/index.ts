import { Struct } from '@polkadot/types';
import { BN } from '@polkadot/util';

export { addTxHistories, addLzHistories } from 'src/modules/account/utils';

// Memo: used for determining if the SS58 account is Lockdrop account
export const ETHEREUM_EXTENSION = 'Ethereum Extension';

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
  LZ_BRIDGE = 'LayerZero Bridge',
  CCIP_BRIDGE = 'CCIP Bridge',
}

export interface TxHistory {
  hash: string;
  type: HistoryTxType;
  timestamp: number;
  data: any;
}
