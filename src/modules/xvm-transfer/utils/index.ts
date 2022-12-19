import { getNetworkName, providerEndpoints } from 'src/config/chainEndpoints';
import {
  getAccountHistories,
  LOCAL_STORAGE,
  updateAccountHistories,
} from 'src/config/localStorage';
import { getTimestamp } from 'src/hooks/helper/common';
import { TxHistory } from 'src/modules/account';
import { HistoryTxType } from 'src/modules/account/index';

const { XVM_TX_HISTORIES, NETWORK_IDX } = LOCAL_STORAGE;

// Memo: store users XVM transaction histories to browser's local-storage
export const addXvmTxHistories = ({
  hash,
  to,
  symbol,
  amount,
  address,
}: {
  hash: string;
  to: string;
  symbol: string;
  amount: string;
  address: string;
}): void => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const network = getNetworkName(Number(networkIdx));
  if (network === 'development') return;

  const txs = getAccountHistories({
    storageKey: XVM_TX_HISTORIES,
    address,
    network,
  }) as TxHistory[];

  const type = HistoryTxType.Xvm;
  const xvmData = {
    to,
    amount,
    symbol,
  };

  const data = {
    type,
    hash,
    timestamp: getTimestamp(),
    data: xvmData,
  };

  txs.unshift(data);
  updateAccountHistories({
    storageKey: XVM_TX_HISTORIES,
    address,
    network,
    txs,
  });
};

export const getXvmTransferContractAddress = (isXvmErc20: boolean): string | undefined => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const contractObj = providerEndpoints[Number(networkIdx)].xvmTransferContract;
  if (contractObj) {
    return isXvmErc20 ? contractObj.xvmErc20 : contractObj.xvmPsp22;
  } else {
    return undefined;
  }
};
