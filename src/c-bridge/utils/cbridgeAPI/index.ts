import axios from 'axios';
import { objToArray } from 'src/hooks/helper/common';
import { getTokenBal } from './../../../web3/utils/index';
import {
  BridgeMethod,
  cBridgeEndpoint,
  CbridgeToken,
  Chain,
  EvmChain,
  PeggedPairConfig,
  SelectedToken,
  supportChains,
  Token,
  TransferConfigs,
} from './../../index';

export const getChainName = (chain: number) => {
  switch (chain) {
    case EvmChain.Ethereum:
      return 'Ethereum';
    case EvmChain.BSC:
      return 'BSC';
    case EvmChain.Astar:
      return 'Astar';
    case EvmChain.Shiden:
      return 'Shiden';
    case EvmChain.Polygon:
      return 'Polygon';

    default:
      return '';
  }
};

const pushCanonicalToken = ({
  tokens,
  srcChain,
  destChain,
  token,
}: {
  tokens: CbridgeToken[];
  srcChain: EvmChain;
  destChain: EvmChain;
  token: PeggedPairConfig;
}) => {
  if (token.org_chain_id === srcChain && token.pegged_chain_id === destChain) {
    tokens.push({ bridgeMethod: BridgeMethod.canonical, canonical: token, pool: null });
  }
  return;
};

const pushPooledToken = ({
  tokens,
  chainA,
  chainB,
  configs,
}: {
  // tokens: PeggedPairConfig[];
  tokens: CbridgeToken[];
  chainA: EvmChain;
  chainB: EvmChain;
  configs: TransferConfigs;
}) => {
  const lookUpTable: Token[] = [];

  const tokensChainA = configs.chain_token[chainA].token;
  const tokensChainB = configs.chain_token[chainB].token;

  const poolContractChainA =
    configs.chains.find((chain) => chain.id === chainA)?.contract_addr ?? null;
  const poolContractChainB =
    configs.chains.find((chain) => chain.id === chainB)?.contract_addr ?? null;

  if (!poolContractChainA || !poolContractChainB) return;

  tokensChainA.forEach((a) => {
    if (!a.token.xfer_disabled) {
      lookUpTable.push(a);
    }
  });

  tokensChainB.forEach((b) => {
    if (!b.token.xfer_disabled) {
      const isExistsInCanonicalBridge = tokens.find((it: CbridgeToken) => {
        if (!it.canonical) return false;
        it.canonical.org_token.token.symbol === b.token.symbol;
      });
      if (isExistsInCanonicalBridge) return;

      lookUpTable.forEach((a) => {
        if (b.name === a.name) {
          const data = {
            bridgeMethod: BridgeMethod.pool,
            canonical: null,
            pool: {
              [chainA]: {
                ...a,
                poolContract: poolContractChainA,
              },
              [chainB]: {
                ...b,
                poolContract: poolContractChainB,
              },
            },
          };
          tokens.push(data);
        }
      });
    }
  });
};

export const getTransferConfigs = async () => {
  const { Ethereum, BSC, Astar, Shiden, Polygon } = EvmChain;

  try {
    const url = cBridgeEndpoint + '/getTransferConfigsForAll';
    const { data } = await axios.get<TransferConfigs>(url);
    const { chains, pegged_pair_configs } = data;

    const ethToAstar: CbridgeToken[] = [];
    const ethToShiden: CbridgeToken[] = [];
    const bscToAstar: CbridgeToken[] = [];
    const bscToShiden: CbridgeToken[] = [];
    const polygonToAstar: CbridgeToken[] = [];
    const polygonToShiden: CbridgeToken[] = [];
    const shidenToAstar: CbridgeToken[] = [];

    const pools = [
      {
        tokens: ethToAstar,
        chainA: Ethereum,
        chainB: Astar,
      },
      {
        tokens: ethToShiden,
        chainA: Ethereum,
        chainB: Shiden,
      },
      {
        tokens: bscToAstar,
        chainA: BSC,
        chainB: Astar,
      },
      {
        tokens: bscToShiden,
        chainA: BSC,
        chainB: Shiden,
      },
      {
        tokens: polygonToAstar,
        chainA: Polygon,
        chainB: Astar,
      },
      {
        tokens: polygonToShiden,
        chainA: Polygon,
        chainB: Shiden,
      },
      {
        tokens: shidenToAstar,
        chainA: Shiden,
        chainB: Astar,
      },
    ];

    // Memo: Making array for `Canonical (mint&burn)` bridge configuration
    pegged_pair_configs.forEach((token) => {
      pushCanonicalToken({ tokens: ethToAstar, srcChain: Ethereum, destChain: Astar, token });
      pushCanonicalToken({ tokens: ethToShiden, srcChain: Ethereum, destChain: Shiden, token });
      pushCanonicalToken({ tokens: bscToAstar, srcChain: BSC, destChain: Astar, token });
      pushCanonicalToken({ tokens: bscToShiden, srcChain: BSC, destChain: Shiden, token });
      pushCanonicalToken({ tokens: polygonToAstar, srcChain: Polygon, destChain: Astar, token });
      pushCanonicalToken({ tokens: polygonToShiden, srcChain: Polygon, destChain: Shiden, token });
      pushCanonicalToken({ tokens: shidenToAstar, srcChain: Shiden, destChain: Astar, token });
    });

    // Memo: Making array for `Pool Based` bridge configuration
    pools.forEach((pool) => {
      pushPooledToken({
        tokens: pool.tokens,
        chainA: pool.chainA,
        chainB: pool.chainB,
        configs: data,
      });
    });

    const supportChain = chains.filter((it) => supportChains.find((that) => that === it.id));
    if (!supportChain) return;

    return {
      supportChain,
      tokens: {
        [Astar]: {
          [Ethereum]: ethToAstar,
          [BSC]: bscToAstar,
          [Polygon]: polygonToAstar,
          [Shiden]: shidenToAstar,
        },
        [Shiden]: {
          [Ethereum]: ethToShiden,
          [BSC]: bscToShiden,
          [Polygon]: polygonToShiden,
          [Astar]: shidenToAstar,
        },
        [Ethereum]: {
          [Astar]: ethToAstar,
          [Shiden]: ethToShiden,
        },
        [BSC]: {
          [Astar]: bscToAstar,
          [Shiden]: bscToShiden,
        },
        [Polygon]: {
          [Astar]: polygonToAstar,
          [Shiden]: polygonToShiden,
        },
      },
    };
  } catch (error: any) {
    console.error(error.message);
  }
};

export const pushToSelectableChains = ({
  tokensObj,
  srcChainId,
  selectableChains,
  supportChains,
}: {
  tokensObj: any;
  srcChainId: EvmChain;
  selectableChains: Chain[];
  supportChains: Chain[];
}) => {
  const chains: CbridgeToken[][] = objToArray(tokensObj[srcChainId]);

  chains.forEach((tokens: CbridgeToken[]) => {
    if (!tokens[0]) return;
    const token = tokens[0];

    // Todo: consider for pool case
    if (!token.canonical) return;

    const id =
      srcChainId === EvmChain.Astar
        ? token.canonical.org_chain_id
        : token.canonical.pegged_chain_id;
    const chain = supportChains.find((it: Chain) => it.id === id);
    chain && selectableChains.push(chain);
  });
};

export const sortChainName = (chains: Chain[]) => {
  chains.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
};

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
