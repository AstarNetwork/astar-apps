import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { ethers } from 'ethers';
import { ASTAR_NETWORK_IDX } from 'src/config/chain';
import { endpointKey, getNetworkName } from 'src/config/chainEndpoints';
import {
  getAccountHistories,
  LOCAL_STORAGE,
  updateAccountHistories,
} from 'src/config/localStorage';
import { pathEvm } from 'src/hooks';
import { getTimestamp, capitalize, hasProperty } from '@astar-network/astar-sdk-core';
import { astarNetworks } from 'src/hooks/xcm/useTransferRouter';
import { SystemAccount, TxHistory } from 'src/modules/account';
import { HistoryTxType } from 'src/modules/account/index';
import { xcmChainObj } from 'src/modules/xcm';
import { astarNativeTokenErcAddr, xcmToken } from 'src/modules/xcm//tokens';
import { ExistentialDeposit, XcmTokenInformation } from 'src/modules/xcm/index';
import { Asset, astarChains, Chain } from 'src/v2/models';

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

export const checkIsAstarNativeToken = (mappedErc20Address: string): boolean => {
  return mappedErc20Address.toLowerCase() === astarNativeTokenErcAddr.toLowerCase();
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
    let bal = '0';
    const isAstarNativeToken = checkIsAstarNativeToken(token.mappedERC20Addr);
    if (isAstarNativeToken) {
      const accountInfo = await api.query.system.account<SystemAccount>(userAddress);
      bal = accountInfo.data.free.sub(accountInfo.data.frozen).toString();
    } else {
      const result = await api.query.assets.account<Account>(String(token.id), userAddress);
      const data = result.toJSON();
      bal = data ? String(data.balance) : '0';
    }

    const formattedBalance = ethers.utils.formatUnits(bal, Number(token.metadata.decimals));
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
  let count = 0;
  return new Promise<boolean>(async (resolve) => {
    try {
      const monitorBal = async (timer?: NodeJS.Timer) => {
        const balance = await fetchXcmBalance({
          userAddress,
          token: originTokenData,
          api,
        });
        const newBal = Number(balance.userBalance);
        const originBal = originTokenData.userBalance;

        // Memo: some tokens are difficult to monitor the balance increasing because the app updates `originBal` faster than running this function
        // in other words, the value of `newBal` will be the same as `originBal`
        // Ref: https://gyazo.com/8c4ec928e59670d7da2930b803cebbaf

        // isExit: returns `true` (exit from this function) within 18 secs
        const isExit = count === 6;
        if (newBal > originBal || isExit) {
          timer && clearInterval(timer);
          resolve(true);
        }
      };
      const intervalMilliSec = 3000;
      const updateIntervalHandler = setInterval(async () => {
        await monitorBal(updateIntervalHandler);
        count++;
      }, intervalMilliSec);
      await monitorBal();
    } catch (error) {
      console.error(error);
      resolve(false);
    }
  });
};

export const checkIsSupportAstarNativeToken = (chain: Chain): boolean => {
  if (!chain) return false;
  const c = xcmChainObj[chain];
  return c.isAstarNativeToken;
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
  if (chain.includes('-')) {
    return chain
      .split('-')
      .map((it) => capitalize(it))
      .join(' ');
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

// Memo: cast the XCM endpoint to chopsticks endpoint
export const castXcmEndpoint = (endpoint: string): string => {
  const extractPort = (e: string): string => {
    if (!e || e === 'null') {
      return '';
    }
    const urlObject = new URL(e);
    return urlObject.port;
  };

  const selectedEndpointStored = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT));
  const selectedEndpoint = JSON.parse(selectedEndpointStored);
  const isCustomEndpoint =
    selectedEndpoint && Object.keys(selectedEndpoint)[0] === String(endpointKey.CUSTOM);

  if (isCustomEndpoint) {
    const selectedCustomEndpoint = Object.values(selectedEndpoint)[0] as string;
    const portSelectedCustomEndpoint = extractPort(selectedCustomEndpoint);
    const isSelectedChopsticksEndpoint =
      portSelectedCustomEndpoint === extractPort(xcmChainObj[Chain.ASTAR].chopsticksEndpoint!) ||
      portSelectedCustomEndpoint === extractPort(xcmChainObj[Chain.SHIDEN].chopsticksEndpoint!);

    if (isSelectedChopsticksEndpoint) {
      const chains = Object.values(xcmChainObj);
      const chain = chains.find((it) => it.endpoints.find((that) => that === endpoint));
      return chain && hasProperty(chain, 'chopsticksEndpoint')
        ? String(chain.chopsticksEndpoint)
        : endpoint;
    }
  }

  return endpoint;
};
