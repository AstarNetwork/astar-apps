import { getNetworkName, providerEndpoints } from 'src/config/chainEndpoints';
import {
  getAccountHistories,
  LOCAL_STORAGE,
  updateAccountHistories,
} from 'src/config/localStorage';
import { getTimestamp } from '@astar-network/astar-sdk-core';
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

export const getXvmTransferContractAddress = (): string | undefined => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  return providerEndpoints[Number(networkIdx)].xvmErcTransferContract || undefined;
};
