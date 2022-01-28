import axios from 'axios';
import ABI from 'human-standard-token-abi';
import { objToArray } from 'src/hooks/helper/common';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { getTokenBal } from './../../web3/utils/index';
import {
  cBridgeEndpoint,
  Chain,
  EvmChain,
  PeggedPairConfig,
  supportChains,
  TransferConfigs,
} from './../index';
import { MaxUint256 } from '@ethersproject/constants';
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

export const formatDecimals = ({ amount, decimals }: { amount: string; decimals: number }) => {
  return Number(Number(amount).toFixed(decimals));
};

export const getTokenInfo = ({
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
}: {
  srcChainId: number;
  selectedToken: PeggedPairConfig;
  address: string;
}) => {
  const tokenInfo = getTokenInfo({ srcChainId, selectedToken });
  return await getTokenBal({
    srcChainId,
    address,
    contractAddress: tokenInfo.token.address,
    tokenSymbol: tokenInfo.token.symbol,
  });
};

export const approve = async ({
  address,
  selectedToken,
  srcChainId,
}: {
  address: string;
  srcChainId: number;
  selectedToken: PeggedPairConfig;
}) => {
  const provider = typeof window !== 'undefined' && window.ethereum;

  if (!provider) {
    throw new Error('No wallet connected');
  }

  const tokenInfo = getTokenInfo({
    selectedToken,
    srcChainId,
  });
  const token = tokenInfo.token.address;
  const spender =
    selectedToken.org_chain_id === srcChainId
      ? selectedToken.pegged_deposit_contract_addr
      : selectedToken.pegged_burn_contract_addr;

  if (!spender) {
    throw new Error('No spender to approve');
  }

  if (!token) {
    throw new Error('No token to approve');
  }

  const web3 = new Web3(provider as any);
  const contract = new web3.eth.Contract(ABI, token);
  const gasPrice = await web3.eth.getGasPrice();
  const rawTx: TransactionConfig = {
    nonce: await web3.eth.getTransactionCount(address),
    gasPrice: web3.utils.toHex(gasPrice),
    from: address,
    to: token,
    value: '0x0',
    data: contract.methods.approve(spender, MaxUint256).encodeABI(),
  };

  const estimatedGas = await web3.eth.estimateGas(rawTx);
  return await web3.eth.sendTransaction({ ...rawTx, gas: estimatedGas });
};
