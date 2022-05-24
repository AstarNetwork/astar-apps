import { Chain, relayChains, xcmChains, XcmChain } from './../index';
import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { ethers } from 'ethers';
import { endpointKey } from 'src/config/chainEndpoints';
import { ChainAsset } from 'src/hooks';
import { getUsdBySymbol } from 'src/hooks/helper/price';
import { ExistentialDeposit, XcmNetworkIdx, XcmTokenInformation } from '..';
import { xcmToken } from '../tokens';

interface Account extends Struct {
  balance: string;
}

export const getXcmToken = ({
  symbol,
  currentNetworkIdx,
}: {
  symbol: string;
  currentNetworkIdx: endpointKey;
}): XcmTokenInformation | undefined => {
  const networkIdx = currentNetworkIdx as XcmNetworkIdx;
  const t = xcmToken[networkIdx].find((it: XcmTokenInformation) => it.symbol === symbol);
  return t;
};

export const fetchXcmBalance = async ({
  userAddress,
  token,
  api,
}: {
  userAddress: string;
  token: ChainAsset;
  api: ApiPromise;
}): Promise<{ userBalance: string; userBalanceUsd: string }> => {
  let userBalanceUsd = '0';
  let userBalance = '0';
  try {
    const result = await api.query.assets.account<Account>(String(token.id), userAddress);
    const data = result.toJSON();
    const balance = data ? String(data.balance) : '0';
    const formattedBalance = ethers.utils.formatUnits(balance, Number(token.metadata.decimals));
    if (Number(formattedBalance) > 0) {
      const usdPrice = await getUsdBySymbol(String(token.metadata.symbol)).catch((error) => {
        console.error(error);
        return 0;
      });
      userBalanceUsd = String(usdPrice * Number(formattedBalance));
    }
    return { userBalance: formattedBalance, userBalanceUsd };
  } catch (error) {
    console.error(error);
    return { userBalance, userBalanceUsd };
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

  const data = {
    amount: Number(ethers.utils.formatUnits(amount, decimals)).toFixed(7),
    symbol,
    chain: chain.toString(),
  };

  return data;
};

export const isFromRelayChain = (fromChain: Chain): boolean => {
  const found = relayChains.find((it) => it === fromChain);
  return found ? true : false;
};

export const getChains = (networkIdx: endpointKey): XcmChain[] => {
  const relayChain = networkIdx === endpointKey.ASTAR ? Chain.Polkadot : Chain.Kusama;
  return xcmChains.filter((it) => it.relayChain === relayChain);
};
