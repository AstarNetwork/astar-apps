import { ApiPromise } from '@polkadot/api';
import { Struct } from '@polkadot/types';
import { ethers } from 'ethers';
import { endpointKey } from 'src/config/chainEndpoints';
import { ChainAsset } from 'src/hooks';
import { getUsdBySymbol } from 'src/hooks/helper/price';
import { XcmNetworkIdx, XcmTokenInformation } from '..';
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
