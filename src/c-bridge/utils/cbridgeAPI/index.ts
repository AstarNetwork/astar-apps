import { SelectedToken } from 'src/c-bridge';
import axios from 'axios';
import { stringifyUrl } from 'query-string';
import { endpointKey } from 'src/config/chainEndpoints';
import { objToArray } from 'src/hooks/helper/common';
import {
  astarSupportChains,
  BridgeMethod,
  cBridgeEndpoint,
  CbridgeToken,
  Chain,
  EvmChain,
  History,
  PeggedPairConfig,
  pendingStatus,
  shidenSupportChains,
  Token,
  TransferConfigs,
  Quotation,
} from './../../index';
import { formatDecimals, getMinAndMaxAmount, getMinimalMaxSlippage, getTokenInfo } from '..';
import { ethers } from 'ethers';

export const getChainName = (chain: number): string => {
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
  const { Ethereum, BSC, Astar, Shiden, Polygon } = EvmChain;

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
}): void => {
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

export const sortChainName = (chains: Chain[]): void => {
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

export const getIcon = ({ symbol, icon }: { symbol: string; icon: string }): string => {
  // Memo: the background color of the icon (url provides by cBridge API) is white color
  const logoUsdt = 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png';
  return symbol === 'USDT' ? logoUsdt : icon;
};

const isShidenOrAstar = (chain: number): boolean => {
  if (chain === EvmChain.Astar || chain === EvmChain.Shiden) {
    return true;
  }
  return false;
};

const filterHistory = (histories: History[]): { histories: History[] | []; isPending: boolean } => {
  let isPending = false;
  if (!histories) return { histories: [], isPending };

  const filtered = histories.filter((history: History) => {
    if (
      isShidenOrAstar(history.src_send_info.chain.id) ||
      isShidenOrAstar(history.dst_received_info.chain.id)
    ) {
      const pending = pendingStatus.find((it) => it === history.status);
      if (pending) {
        isPending = true;
      }
      return history;
    }
  });
  return { histories: filtered, isPending };
};

// Ref: https://cbridge-docs.celer.network/developer/api-reference/gateway-transferhistory
export const getHistory = async (
  address: string
): Promise<{ histories: History[] | []; isPending: boolean }> => {
  try {
    const url = stringifyUrl({
      url: cBridgeEndpoint.History,
      query: {
        addr: address,
        page_size: 99,
      },
    });
    const { data } = await axios.get<{ history: History[] }>(url);
    const { histories, isPending } = filterHistory(data.history);
    return { histories, isPending };
  } catch (error: any) {
    console.error(error.message);
    return { histories: [], isPending: false };
  }
};

// Ref: https://cbridge-docs.celer.network/developer/api-reference/gateway-gettransferstatus#transferhistorystatus-enum
export const getTxStatus = (status: number): string => {
  switch (status) {
    case 0:
      return 'TRANSFER_UNKNOWN';
    case 1:
      return 'TRANSFER_SUBMITTING';
    case 2:
      return 'TRANSFER_FAILED';
    case 3:
      return 'TRANSFER_WAITING_FOR_SGN_CONFIRMATION';
    case 4:
      return 'TRANSFER_WAITING_FOR_FUND_RELEASE';
    case 5:
      return 'TRANSFER_COMPLETED';
    case 6:
      return 'TRANSFER_TO_BE_REFUNDED';
    case 7:
      return 'TRANSFER_REQUESTING_REFUND';
    case 8:
      return 'TRANSFER_REFUND_TO_BE_CONFIRMED';
    case 9:
      return 'TRANSFER_CONFIRMING_YOUR_REFUND';
    case 10:
      return 'TRANSFER_REFUNDED';
    default:
      return 'TRANSFER_UNKNOWN';
  }
};

// Ref: https://cbridge-docs.celer.network/developer/api-reference/gateway-estimateamt
export const fetchEstimation = async ({
  amount,
  srcChainId,
  destChainId,
  selectedToken,
  address,
}: {
  amount: number;
  srcChainId: EvmChain;
  destChainId: EvmChain;
  selectedToken: SelectedToken;
  address: string;
}): Promise<Quotation> => {
  const { symbol, decimals } = getTokenInfo({
    srcChainId,
    selectedToken,
  });

  const token_symbol = symbol;
  const amt = ethers.utils.parseUnits(amount.toString(), decimals).toString();
  const is_pegged = selectedToken.bridgeMethod === BridgeMethod.canonical;
  // Memo: 3000 -> 0.3%
  let slippage_tolerance = 3000;

  if (!is_pegged) {
    const minimalMaxSlippage = await getMinimalMaxSlippage({
      srcChainId,
      selectedToken,
    });
    slippage_tolerance =
      slippage_tolerance > minimalMaxSlippage ? slippage_tolerance : minimalMaxSlippage;
  }

  const url = stringifyUrl({
    url: cBridgeEndpoint.Quotation,
    query: {
      src_chain_id: srcChainId,
      dst_chain_id: destChainId,
      token_symbol,
      amt,
      usr_addr: address,
      slippage_tolerance,
      is_pegged,
    },
  });
  const { data } = await axios.get<Quotation>(url);

  const baseFee = formatDecimals({
    amount: ethers.utils.formatUnits(data.base_fee, decimals).toString(),
    decimals: 6,
  });

  const estimatedReceiveAmount = formatDecimals({
    amount: ethers.utils.formatUnits(data.estimated_receive_amt, decimals).toString(),
    decimals: 8,
  });

  const { min, max } = await getMinAndMaxAmount({
    srcChainId,
    selectedToken,
  });

  const quotation = {
    ...data,
    bridge_rate: formatDecimals({
      amount: String(data.bridge_rate),
      decimals: 2,
    }),
    base_fee: String(baseFee),
    estimated_receive_amt: String(estimatedReceiveAmount),
    minAmount: min,
    maxAmount: max,
  };
  return quotation;
};
