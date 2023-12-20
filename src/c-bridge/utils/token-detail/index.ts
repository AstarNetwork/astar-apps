import { Erc20Token } from 'src/modules/token';
import {
  BridgeMethod,
  cbridgeCastToken,
  CbridgeCurrency,
  CbridgeToken,
  PeggedPairConfig,
  Token,
} from 'src/c-bridge';
import { hasProperty } from '@astar-network/astar-sdk-core';

export const getSelectedToken = ({
  srcChainId,
  token,
}: {
  token: CbridgeToken;
  srcChainId: number;
}): CbridgeCurrency | undefined => {
  if (!token) return;
  if (token.bridgeMethod === BridgeMethod.canonical) {
    if (!token.canonical) return;
    const tokenInfo = getPeggedTokenInfo({ srcChainId, selectedToken: token.canonical });

    const data = {
      bridgeMethod: token.bridgeMethod,
      canonicalConfig: token.canonical,
      poolConfig: null,
      name: tokenInfo.name,
      symbol: tokenInfo.token.symbol,
      address: tokenInfo.token.address,
      icon: tokenInfo.icon,
      decimal: tokenInfo.token.decimal,
      userBalance: '0',
      userBalanceUsd: '0',
    };
    return data;
  }
  const tokenPool = token.pool && token.pool[srcChainId];
  if (!tokenPool) return;

  return {
    bridgeMethod: token.bridgeMethod,
    canonicalConfig: null,
    poolConfig: token.pool,
    name: tokenPool.name,
    symbol: tokenPool.token.symbol,
    address: tokenPool.token.address,
    icon: tokenPool.icon,
    decimal: tokenPool.token.decimal,
    userBalance: '0',
    userBalanceUsd: '0',
  };
};

const getPeggedTokenInfo = ({
  srcChainId,
  selectedToken,
}: {
  srcChainId: number;
  selectedToken: PeggedPairConfig;
}): Token => {
  return srcChainId === selectedToken.org_chain_id
    ? selectedToken.org_token
    : selectedToken.pegged_token;
};

export const checkIsCbridgeToken = (token: Erc20Token): boolean => {
  return token.isCbridgeToken || false;
};

export const castCbridgeTokenData = (token: Erc20Token): Erc20Token => {
  const symbolKey = token.symbol.toUpperCase();
  if (hasProperty(cbridgeCastToken, symbolKey)) {
    const data = cbridgeCastToken[symbolKey as keyof typeof cbridgeCastToken];
    return {
      ...token,
      name: data.name,
      symbol: data.symbol,
      image: data.image ? data.image : token.image,
    };
  } else {
    return token;
  }
};
