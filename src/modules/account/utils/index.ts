import { ApiPromise } from '@polkadot/api';
import { SystemAccount } from '../index';

import { getNetworkName } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { TxHistory } from './../index';

const { TX_HISTORIES, NETWORK_IDX } = LOCAL_STORAGE;

export const fetchNativeBalance = async ({
  api,
  address,
}: {
  api: ApiPromise;
  address: string;
}) => {
  try {
    const accountInfo = await api.query.system.account<SystemAccount>(address);
    const balance = accountInfo.data.free;
    return balance.toString();
  } catch (error) {
    console.error(error);
    return '0';
  }
};

// Memo: get users transaction histories from browser's local-storage
export const getTxHistories = ({
  address,
  network,
}: {
  address: string;
  network: string;
}): TxHistory[] => {
  const histories = localStorage.getItem(TX_HISTORIES);
  const data = histories ? JSON.parse(histories) : {};

  if (data.hasOwnProperty(address)) {
    const addressData = data[address];
    if (addressData.hasOwnProperty(network)) {
      return addressData[network];
    }
  }
  return [];
};

export const updateTxHistories = ({
  hash,
  type,
  address,
  network,
}: {
  hash: string;
  type: string;
  address: string;
  network: string;
}): void => {
  let newDataObj;
  const numberOfStoredTxs = 5;
  const txs = getTxHistories({ address, network });
  const data = {
    hash,
    type,
  };
  txs.unshift(data);
  txs.slice(0, numberOfStoredTxs);

  const histories = localStorage.getItem(TX_HISTORIES);
  const historiesData = histories ? JSON.parse(histories) : {};
  if (historiesData.hasOwnProperty(address)) {
    const addressData = historiesData[address];
    newDataObj = { ...historiesData, [address]: { ...addressData, [network]: txs } };
  } else {
    const newData = { [network]: txs };
    newDataObj = { ...historiesData, [address]: newData };
  }
  localStorage.setItem(TX_HISTORIES, JSON.stringify(newDataObj));
};

export const addTxHistories = ({
  hash,
  type,
  address,
}: {
  hash: string;
  type: string;
  address: string;
}): void => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const network = getNetworkName(Number(networkIdx));
  network !== 'development' &&
    updateTxHistories({
      hash,
      type,
      address,
      network,
    });
};
