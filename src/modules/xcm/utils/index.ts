import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { ethers } from 'ethers';
import { ASTAR_NETWORK_IDX, endpointKey, getNetworkName } from 'src/config/chainEndpoints';
import {
  getAccountHistories,
  LOCAL_STORAGE,
  updateAccountHistories,
} from 'src/config/localStorage';
import { pathEvm } from 'src/hooks';
import { getTimestamp } from 'src/hooks/helper/common';
import { TxHistory } from 'src/modules/account';
import { Asset } from 'src/v2/models';
import { astarChains, ExistentialDeposit, XcmTokenInformation } from '../index';
import { xcmToken } from '../tokens';
import { astarNetworks } from './../../../hooks/xcm/useTransferRouter';
import { HistoryTxType } from './../../account/index';
import { Chain } from './../index';

const { XCM_TX_HISTORIES, NETWORK_IDX } = LOCAL_STORAGE;
interface Account extends Struct {
  balance: string;
}

export const getXcmToken = ({
  id,
  currentNetworkIdx,
}: {
  id: string;
  currentNetworkIdx: endpointKey;
}): XcmTokenInformation | undefined => {
  const networkIdx = currentNetworkIdx as ASTAR_NETWORK_IDX;
  const t = xcmToken[networkIdx].find((it: XcmTokenInformation) => it.assetId === id);
  return t;
};

export const fetchXcmBalance = async ({
  userAddress,
  token,
  api,
}: {
  userAddress: string;
  token: Asset;
  api: ApiPromise;
}): Promise<{ userBalance: string }> => {
  let userBalance = '0';
  try {
    const result = await api.query.assets.account<Account>(String(token.id), userAddress);
    const data = result.toJSON();
    const balance = data ? String(data.balance) : '0';
    const formattedBalance = ethers.utils.formatUnits(balance, Number(token.metadata.decimals));
    return { userBalance: formattedBalance };
  } catch (error) {
    console.error(error);
    return { userBalance };
  }
};

const calRelaychainMinBal = (existentialDeposit: number): number => {
  // Memo: hardcode it because ED for KSM is too small
  const ksmMinBal = 0.0001;
  const minBal = existentialDeposit * 1.1;

  if (existentialDeposit > ksmMinBal) {
    return minBal;
  } else {
    return ksmMinBal;
  }
};

export const fetchExistentialDeposit = async (api: ApiPromise): Promise<ExistentialDeposit> => {
  const amount = api.consts.balances.existentialDeposit.toString();

  const [properties, chain] = await Promise.all([
    api.rpc.system.properties(),
    api.rpc.system.chain(),
  ]);
  // Fixme: gives correct interface
  const formattedProperties = properties.toHuman() as any;
  const decimals = formattedProperties.tokenDecimals[0] as string;
  const symbol = formattedProperties.tokenSymbol[0] as string;
  const existentialDeposit = Number(ethers.utils.formatUnits(amount, decimals)).toFixed(7);
  const originChainMinBal = calRelaychainMinBal(Number(existentialDeposit));

  const data = {
    amount: existentialDeposit,
    symbol,
    chain: chain.toString(),
    originChainMinBal,
  };

  return data;
};

export const checkIsDeposit = (fromChain: Chain): boolean => {
  return !astarChains.includes(fromChain);
};

export const monitorBalanceIncreasing = async ({
  originTokenData,
  api,
  userAddress,
}: {
  originTokenData: Asset;
  api: ApiPromise;
  userAddress: string;
}): Promise<boolean> => {
  return new Promise<boolean>(async (resolve) => {
    try {
      const monitorBal = async (timer?: NodeJS.Timer) => {
        const balance = await fetchXcmBalance({
          userAddress,
          token: originTokenData,
          api,
        });
        const bal = Number(balance.userBalance);
        if (bal > originTokenData.userBalance) {
          timer && clearInterval(timer);
          resolve(true);
        }
      };
      const intervalMilliSec = 3000;
      const updateIntervalHandler = setInterval(async () => {
        await monitorBal(updateIntervalHandler);
      }, intervalMilliSec);
      await monitorBal();
    } catch (error) {
      console.error(error);
      resolve(false);
    }
  });
};

export const checkIsRelayChain = (chain: string): boolean => {
  if (!chain) return false;
  const c = chain.toLowerCase();
  return c === Chain.POLKADOT.toLowerCase() || c === Chain.KUSAMA.toLowerCase();
};

export const castChainName = (chain: string): string => {
  const isEvm = chain.includes(pathEvm);
  if (isEvm) {
    const network = chain.split('-')[0];
    return network + ' ' + '(EVM)';
  }
  if (chain && astarNetworks.includes(chain.toLowerCase())) {
    return chain + ' ' + '(Native)';
  }
  return chain;
};

export const removeEvmName = (chain: string) => {
  if (chain.includes(pathEvm)) {
    return chain.split('-')[0];
  }
  return chain;
};

// Memo: store users XCM transaction histories to browser's local-storage
export const addXcmTxHistories = ({
  hash,
  from,
  to,
  symbol,
  amount,
  address,
}: {
  hash: string;
  from: string;
  to: string;
  symbol: string;
  amount: string;
  address: string;
}): void => {
  const networkIdx = localStorage.getItem(NETWORK_IDX);
  const network = getNetworkName(Number(networkIdx));
  if (network === 'development') return;

  const txs = getAccountHistories({
    storageKey: XCM_TX_HISTORIES,
    address,
    network,
  }) as TxHistory[];

  const type = HistoryTxType.Xcm;
  const xcmData = {
    from,
    to,
    amount,
    symbol,
  };

  const data = {
    type,
    hash,
    timestamp: getTimestamp(),
    data: xcmData,
  };

  txs.unshift(data);
  updateAccountHistories({
    storageKey: XCM_TX_HISTORIES,
    address,
    network,
    txs,
  });
};
