import { updateAccountHistories } from 'src/config/localStorage';
import { HistoryTxType, TxHistory } from 'src/modules/account';
import { getTimestamp } from '@astar-network/astar-sdk-core';
import { getNetworkName } from 'src/config/chainEndpoints';
import { getAccountHistories, LOCAL_STORAGE } from 'src/config/localStorage';

const { TX_HISTORIES, NETWORK_IDX } = LOCAL_STORAGE;

// Memo: store users transaction histories to browser's local-storage
export const addTxHistories = ({
  hash,
  type,
  address,
}: {
  hash: string;
  type: HistoryTxType;
  address: string;
}): void => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const network = getNetworkName(Number(networkIdx));
  if (network === 'development') return;

  const txs = getAccountHistories({ storageKey: TX_HISTORIES, address, network }) as TxHistory[];
  const data = {
    hash,
    type,
    timestamp: getTimestamp(),
    data: null,
  };
  txs.unshift(data);

  updateAccountHistories({
    storageKey: TX_HISTORIES,
    address,
    network,
    txs,
  });
};

// Memo: store users lz bridge histories to browser's local-storage
export const addLzHistories = ({
  hash,
  type,
  address,
  amount,
  symbol,
  fromChainId,
  toChainId,
}: {
  hash: string;
  type: HistoryTxType;
  address: string;
  amount: string;
  symbol: string;
  fromChainId: number;
  toChainId: number;
}): void => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const network = getNetworkName(Number(networkIdx));

  const txs = getAccountHistories({ storageKey: TX_HISTORIES, address, network }) as TxHistory[];
  const data = {
    hash,
    type,
    timestamp: getTimestamp(),
    data: {
      amount,
      symbol,
      fromChainId,
      toChainId,
    },
  };
  txs.unshift(data);

  updateAccountHistories({
    storageKey: TX_HISTORIES,
    address,
    network,
    txs,
  });
};
