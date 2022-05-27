import { BridgeMethod, CbridgeToken, PeggedPairConfig, SelectedToken, Token } from 'src/c-bridge';

export const getSelectedToken = ({
  srcChainId,
  token,
}: {
  token: CbridgeToken;
  srcChainId: number;
}): SelectedToken | undefined => {
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

export const checkIsCbridgeToken = (token: any): boolean => {
  return token.hasOwnProperty('bridgeMethod');
};
