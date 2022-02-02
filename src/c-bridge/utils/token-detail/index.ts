import { CbridgeToken, SelectedToken, BridgeMethod, PeggedPairConfig } from 'src/c-bridge';
import { getTokenBal } from 'src/web3';

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
  };
};

export const getTokenInfo = ({
  srcChainId,
  selectedToken,
}: {
  srcChainId: number;
  selectedToken: SelectedToken;
}) => {
  // Memo: Pick Pool Config
  if (selectedToken.bridgeMethod === BridgeMethod.pool) {
    if (selectedToken.poolConfig === null) {
      throw Error('Cannot find pool config');
    }
    return {
      contractAddress: selectedToken.poolConfig[srcChainId].poolContract,
      tokenAddress: selectedToken.poolConfig[srcChainId].token.address,
      symbol: selectedToken.symbol,
      decimals: selectedToken.poolConfig[srcChainId].token.decimal,
    };
  }

  // Memo: Pick Canonical Config
  if (!selectedToken.canonicalConfig) {
    throw Error('Cannot find canonical config');
  }

  const tokenInfo = getPeggedTokenInfo({
    selectedToken: selectedToken.canonicalConfig,
    srcChainId,
  });

  const isDeposit = selectedToken.canonicalConfig.org_chain_id === srcChainId;

  const contractAddress = isDeposit
    ? selectedToken.canonicalConfig.pegged_deposit_contract_addr
    : selectedToken.canonicalConfig.pegged_burn_contract_addr;

  return {
    contractAddress: contractAddress,
    tokenAddress: tokenInfo.token.address,
    symbol: tokenInfo.token.symbol,
    decimals: tokenInfo.token.decimal,
  };
};

export const getPeggedTokenInfo = ({
  srcChainId,
  selectedToken,
}: {
  srcChainId: number;
  selectedToken: PeggedPairConfig;
}) => {
  return srcChainId === selectedToken.org_chain_id
    ? selectedToken.org_token
    : selectedToken.pegged_token;
};

export const getTokenBalCbridge = async ({
  srcChainId,
  selectedToken,
  address,
  cbridgeToken,
}: {
  srcChainId: number;
  selectedToken?: SelectedToken;
  cbridgeToken?: CbridgeToken;
  address: string;
}): Promise<string> => {
  try {
    if (cbridgeToken) {
      const token = getSelectedToken({ token: cbridgeToken, srcChainId });

      if (!token) return '0';
      return await getTokenBal({
        srcChainId,
        address,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
      });
    }

    if (!selectedToken) {
      throw Error('cannot find selectedToken');
    }

    const { tokenAddress, symbol } = getTokenInfo({ selectedToken, srcChainId });
    if (!tokenAddress) return '0';
    return await getTokenBal({
      srcChainId,
      address,
      tokenAddress,
      tokenSymbol: symbol,
    });
  } catch (error: any) {
    console.error(error.message);
    return '0';
  }
};
