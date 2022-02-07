import { nativeCurrency } from './../../../web3/index';
import {
  CbridgeToken,
  SelectedToken,
  BridgeMethod,
  PeggedPairConfig,
  EvmChain,
} from 'src/c-bridge';
import { getTokenBal, getTokenExplorer } from 'src/web3';

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

export const getDestTokenInfo = ({
  selectedToken,
  destChainId,
}: {
  selectedToken: SelectedToken;
  destChainId: EvmChain;
}): { isNativeToken: boolean; address: string; url: string } | false => {
  if (selectedToken.bridgeMethod === BridgeMethod.canonical) {
    const token =
      destChainId === selectedToken.canonicalConfig?.pegged_chain_id
        ? selectedToken.canonicalConfig?.pegged_token
        : selectedToken.canonicalConfig?.org_token;
    const address = token?.token.address;
    const isNativeToken = nativeCurrency[destChainId].name === token?.token.symbol;
    if (!address) return false;
    return {
      isNativeToken,
      address,
      url: getTokenExplorer({ address, chainId: destChainId }),
    };
  } else {
    const tokenDetail = selectedToken.poolConfig![destChainId];
    const address = tokenDetail.token.address;
    const isNativeToken = nativeCurrency[destChainId].name === tokenDetail.token.symbol;
    return {
      isNativeToken,
      address,
      url: getTokenExplorer({ address, chainId: destChainId }),
    };
  }
};

export const getTokenBalCbridge = async ({
  srcChainId,
  selectedToken,
  address,
}: {
  srcChainId: number;
  selectedToken: SelectedToken;
  address: string;
}): Promise<string> => {
  try {
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
