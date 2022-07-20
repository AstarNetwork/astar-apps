import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { ethers } from 'ethers';
import { ASTAR_NETWORK_IDX, endpointKey } from 'src/config/chainEndpoints';
import { Asset } from 'src/v2/models';
import { getUsdBySymbol } from 'src/hooks/helper/price';
import { ExistentialDeposit, XcmTokenInformation } from '../index';
import { xcmToken } from '../tokens';
import { Chain, parachains, relayChains } from './../index';

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

export const checkIsFromRelayChain = (fromChain: Chain): boolean => {
  const found =
    relayChains.find((it) => it === fromChain) || parachains.find((it) => it === fromChain);
  return found ? true : false;
};
