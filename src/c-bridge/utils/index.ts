import axios from 'axios';
import { objToArray } from 'src/hooks/helper/common';
import {
  cBridgeEndpoint,
  EvmChain,
  PeggedPairConfig,
  TransferConfigs,
  supportChains,
  Chain,
} from './../index';

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

const pushToken = ({
  tokens,
  srcChain,
  destChain,
  token,
}: {
  tokens: PeggedPairConfig[];
  srcChain: EvmChain;
  destChain: EvmChain;
  token: PeggedPairConfig;
}) => {
  if (token.org_chain_id === srcChain && token.pegged_chain_id === destChain) {
    tokens.push(token);
  }
  return;
};

export const getTransferConfigs = async () => {
  const url = cBridgeEndpoint + '/getTransferConfigsForAll';
  try {
    const { data } = await axios.get<TransferConfigs>(url);
    const { chains, pegged_pair_configs } = data;

    const ethToAstar: PeggedPairConfig[] = [];
    const ethToShiden: PeggedPairConfig[] = [];
    const bscToAstar: PeggedPairConfig[] = [];
    const bscToShiden: PeggedPairConfig[] = [];
    const polygonToAstar: PeggedPairConfig[] = [];
    const polygonToShiden: PeggedPairConfig[] = [];
    const shidenToAstar: PeggedPairConfig[] = [];

    const { Ethereum, BSC, Astar, Shiden, Polygon } = EvmChain;

    pegged_pair_configs.forEach((token) => {
      pushToken({ tokens: ethToAstar, srcChain: Ethereum, destChain: Astar, token });
      pushToken({ tokens: ethToShiden, srcChain: Ethereum, destChain: Shiden, token });
      pushToken({ tokens: bscToAstar, srcChain: BSC, destChain: Astar, token });
      pushToken({ tokens: bscToShiden, srcChain: BSC, destChain: Shiden, token });
      pushToken({ tokens: polygonToAstar, srcChain: Polygon, destChain: Astar, token });
      pushToken({ tokens: polygonToShiden, srcChain: Polygon, destChain: Shiden, token });
      pushToken({ tokens: shidenToAstar, srcChain: Shiden, destChain: Astar, token });
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

export const isAstarOrShiden = (chainId: number) => {
  switch (chainId) {
    case EvmChain.Astar:
      return true;

    case EvmChain.Shiden:
      return true;

    default:
      return false;
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
  const chains: PeggedPairConfig[][] = objToArray(tokensObj[srcChainId]);
  chains.forEach((tokens: PeggedPairConfig[]) => {
    if (!tokens[0]) return;
    const token = tokens[0];
    const id = srcChainId === EvmChain.Astar ? token.org_chain_id : token.pegged_chain_id;
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
