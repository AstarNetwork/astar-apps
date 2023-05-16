import axios from 'axios';
import { endpointKey } from 'src/config/chainEndpoints';
import {
  astarSupportChains,
  BridgeMethod,
  cBridgeEndpoint,
  CbridgeToken,
  EvmChain,
  PeggedPairConfig,
  shidenSupportChains,
  Token,
  TransferConfigs,
} from 'src/c-bridge';

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
}): void => {
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
  tokens: CbridgeToken[];
  chainA: EvmChain;
  chainB: EvmChain;
  configs: TransferConfigs;
}): void => {
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
      // Memo: no need to add the token data if `tokens` array has the token data (that should be `CanonicalToken`) already
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
                id: chainA,
              },
              [chainB]: {
                ...b,
                poolContract: poolContractChainB,
                id: chainB,
              },
            },
          };
          tokens.push(data);
        }
      });
    }
  });
};

// Ref: https://cbridge-docs.celer.network/developer/api-reference/gateway-gettransferconfigs
// Memo: filter/cast the `chains` and `tokens` interface to convenient for bridge page in Astar Portal
export const getTransferConfigs = async (portalNetworkIdx: endpointKey) => {
  const { Ethereum, BSC, Astar, Shiden, Polygon, Injective } = EvmChain;

  try {
    const url = cBridgeEndpoint.Configs;
    const { data } = await axios.get<TransferConfigs>(url);
    const { chains, pegged_pair_configs, chain_token } = data;

    const ethToAstar: CbridgeToken[] = [];
    const ethToShiden: CbridgeToken[] = [];
    const bscToAstar: CbridgeToken[] = [];
    const bscToShiden: CbridgeToken[] = [];
    const polygonToAstar: CbridgeToken[] = [];
    const polygonToShiden: CbridgeToken[] = [];
    const shidenToAstar: CbridgeToken[] = [];
    const injectiveToAstar: CbridgeToken[] = [];

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
      {
        tokens: injectiveToAstar,
        chainA: Injective,
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
      pushCanonicalToken({
        tokens: injectiveToAstar,
        srcChain: Injective,
        destChain: Astar,
        token,
      });
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

    const supportChains =
      portalNetworkIdx === endpointKey.SHIDEN ? shidenSupportChains : astarSupportChains;
    const supportChain = chains.filter((it) => supportChains.find((that) => that === it.id));
    if (!supportChain) return;

    // Memo: get token icons for History modal
    const omitChainIdArray = Object.values(chain_token);
    const formattedArray = omitChainIdArray.map((it) => {
      return it.token;
    });
    const tokenIcons = formattedArray.flat().map((it) => {
      return {
        symbol: it.token.symbol,
        icon: it.icon,
      };
    });

    return {
      supportChain,
      tokenIcons,
      tokens: {
        [Astar]: {
          [Ethereum]: ethToAstar,
          [BSC]: bscToAstar,
          [Polygon]: polygonToAstar,
          [Injective]: injectiveToAstar,
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
        [Injective]: {
          [Astar]: injectiveToAstar,
        },
      },
    };
  } catch (error: any) {
    console.error(error.message);
  }
};
