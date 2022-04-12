import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { registeredErc20Tokens, Erc20Token } from '..';
import { getIcon } from '../../../c-bridge';

export const getTokenImage = ({
  isNativeToken,
  symbol,
  iconUrl,
}: {
  isNativeToken: boolean;
  symbol: string;
  iconUrl?: string;
}): string => {
  if (isNativeToken) {
    return symbol === 'SDN' ? 'icons/sdn-token.png' : 'icons/astar.png';
  } else {
    return getIcon({ icon: String(iconUrl), symbol });
  }
};

export const getErc20Explorer = ({
  currentNetworkIdx,
  tokenAddress,
}: {
  currentNetworkIdx: endpointKey;
  tokenAddress: string;
}) => {
  const base = providerEndpoints[currentNetworkIdx].blockscout;
  return base + '/token/' + tokenAddress;
};

export const checkIsWrappedToken = ({
  tokenAddress,
  srcChainId,
}: {
  tokenAddress: string;
  srcChainId: number;
}) => {
  const token = registeredErc20Tokens.find(
    (it: Erc20Token) => it.srcChainId === srcChainId && it.address === tokenAddress
  );
  if (!token) {
    throw Error(`token address ${tokenAddress} is not registered`);
  }

  return token.isWrappedToken && token.srcChainId === srcChainId;
};
