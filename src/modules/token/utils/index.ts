import { CbridgeCurrency } from 'src/c-bridge';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { Erc20Token, registeredErc20Tokens, tokenImageMap } from 'src/modules/token';
import { xcmToken } from 'src/modules/xcm';
import { Asset } from 'src/v2/models';

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
    return iconUrl || 'custom-token';
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

export const getRegisteredERC20Token = ({
  network,
  assets,
}: {
  network: endpointKey;
  assets: Asset[];
}): Erc20Token[] => {
  const storedTokens = getStoredERC20Tokens().map((it: Erc20Token) => {
    return {
      ...it,
      image: tokenImageMap.hasOwnProperty(it.symbol)
        ? tokenImageMap[it.symbol as keyof typeof tokenImageMap]
        : 'custom-token',
    };
  });
  return getRegisteredErc20Tokens({ network, assets }).concat(storedTokens);
};

export const getStoredERC20Tokens = (): Erc20Token[] => {
  const data = localStorage.getItem(LOCAL_STORAGE.EVM_TOKEN_IMPORTS);
  return data ? JSON.parse(data) : [];
};

export const storeImportedERC20Token = (token: Erc20Token) => {
  const tokens = getStoredERC20Tokens();
  tokens.push(token);
  localStorage.setItem(LOCAL_STORAGE.EVM_TOKEN_IMPORTS, JSON.stringify(tokens));
};

export const castCbridgeToErc20 = ({
  token,
  srcChainId,
}: {
  token: CbridgeCurrency;
  srcChainId: number;
}): Erc20Token => {
  return {
    srcChainId,
    address: token.address,
    decimal: token.decimal,
    symbol: token.symbol,
    name: token.name,
    image: token.icon,
    isWrappedToken: false,
    isXC20: false,
    wrapUrl: null,
    userBalance: token.userBalance,
    userBalanceUsd: token.userBalanceUsd,
    isCbridgeToken: true,
  };
};

export const getRegisteredErc20Tokens = ({
  network,
  assets,
}: {
  network: endpointKey;
  assets: Asset[];
}): Erc20Token[] => {
  const xc20Tokens = xcmToken[network].map((it) => {
    try {
      const asset = assets.find((that) => that.id === it.assetId) as Asset;
      return {
        srcChainId: Number(providerEndpoints[network].evmChainId),
        address: asset.mappedERC20Addr,
        decimal: asset.metadata.decimals,
        symbol: asset.metadata.symbol,
        name: asset.metadata.name,
        image: it.logo,
        isWrappedToken: false,
        isXC20: true,
        wrapUrl: null,
      };
    } catch (error) {
      console.error(error);
      return undefined;
    }
  });

  return (xc20Tokens.filter((it) => it !== undefined) as Erc20Token[]).concat(
    registeredErc20Tokens
  );
};
