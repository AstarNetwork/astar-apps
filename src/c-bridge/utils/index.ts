import { nativeCurrency } from './../../web3/index';
import axios from 'axios';
import ABI from 'human-standard-token-abi';
import CANONICAL_DEPOSIT_ABI from 'src/c-bridge/abi/canonical-deposit.json';
import CANONICAL_BURN_ABI from 'src/c-bridge/abi/canonical-burn.json';
import { ethers } from 'ethers';
import { objToArray } from 'src/hooks/helper/common';
import Web3 from 'web3';
import { TransactionConfig } from 'web3-eth';
import { buildWeb3Instance, getTokenBal } from './../../web3/utils/index';
import {
  cBridgeEndpoint,
  Chain,
  EvmChain,
  PeggedPairConfig,
  supportChains,
  TransferConfigs,
} from './../index';
import { MaxUint256 } from '@ethersproject/constants';
import { AbiItem } from 'web3-utils';

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
  provider,
}: {
  address: string;
  srcChainId: number;
  selectedToken: PeggedPairConfig;
  provider: any;
}): Promise<string> => {
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
  const hash = await new Promise<string>(async (resolve, reject) => {
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        resolve(transactionHash);
      });
  });

  return hash;
};

export const mintOrBurn = async ({
  selectedToken,
  amount,
  srcChainId,
  provider,
  address,
}: {
  amount: string;
  srcChainId: number;
  selectedToken: PeggedPairConfig;
  provider: any;
  address: string;
}): Promise<string> => {
  if (!provider) {
    throw new Error('No wallet connected');
  }

  const tokenInfo = getTokenInfo({
    selectedToken,
    srcChainId,
  });
  const token = tokenInfo.token.address;
  const isDeposit = selectedToken.org_chain_id === srcChainId;

  const contractAddress = isDeposit
    ? selectedToken.pegged_deposit_contract_addr
    : selectedToken.pegged_burn_contract_addr;

  if (!contractAddress || !token) {
    throw new Error('Cannnot find the contract or token address');
  }

  const web3 = new Web3(provider as any);

  const abi = isDeposit ? CANONICAL_DEPOSIT_ABI : CANONICAL_BURN_ABI;
  const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
  const gasPrice = await web3.eth.getGasPrice();
  const isNativeToken = nativeCurrency[srcChainId].name === tokenInfo.token.symbol;
  const sendAmount = ethers.utils.parseUnits(amount, tokenInfo.token.decimal).toString();
  const timestamp = String(Math.floor(Date.now()));

  const getData = () => {
    if (isDeposit) {
      if (isNativeToken) {
        return contract.methods
          .depositNative(sendAmount, selectedToken.pegged_chain_id, address, timestamp)
          .encodeABI();
      }
      return contract.methods
        .deposit(token, sendAmount, selectedToken.pegged_chain_id, address, timestamp)
        .encodeABI();
    }
    return contract.methods.burn(token, sendAmount, address, timestamp).encodeABI();
  };

  const rawTx: TransactionConfig = {
    nonce: await web3.eth.getTransactionCount(address),
    gasPrice: web3.utils.toHex(gasPrice),
    from: address,
    to: contractAddress,
    value: isNativeToken ? sendAmount : '0x0',
    data: getData(),
  };

  const estimatedGas = await web3.eth.estimateGas(rawTx);
  const hash = await new Promise<string>(async (resolve, reject) => {
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        resolve(transactionHash);
      });
  });

  return hash;
};

export const getCanonicalMinAndMaxAmount = async ({
  srcChainId,
  selectedToken,
}: {
  selectedToken: PeggedPairConfig;
  srcChainId: number;
}): Promise<{ min: number; max: number }> => {
  try {
    const web3 = buildWeb3Instance(srcChainId);
    const tokenInfo = getTokenInfo({
      selectedToken,
      srcChainId,
    });
    const token = tokenInfo.token.address;
    const decimals = tokenInfo.token.decimal;
    const isDeposit = selectedToken.org_chain_id === srcChainId;
    const contractAddress = isDeposit
      ? selectedToken.pegged_deposit_contract_addr
      : selectedToken.pegged_burn_contract_addr;

    if (!contractAddress || !token || !web3) {
      throw new Error('Cannnot find the web3 instance, contract or token address');
    }

    const abi = isDeposit ? CANONICAL_DEPOSIT_ABI : CANONICAL_BURN_ABI;
    const contract = new web3.eth.Contract(abi as AbiItem[], contractAddress);
    const isNativeToken = nativeCurrency[srcChainId].name === tokenInfo.token.symbol;

    if (isDeposit) {
      const nativeWrap = isNativeToken && (await contract.methods.nativeWrap().call());
      const results = await Promise.all([
        contract.methods.minDeposit(isNativeToken ? nativeWrap : token).call(),
        contract.methods.maxDeposit(isNativeToken ? nativeWrap : token).call(),
      ]);
      return {
        min: Number(ethers.utils.formatUnits(results[0], decimals)),
        max: Number(ethers.utils.formatUnits(results[1], decimals)),
      };
    }

    const results = await Promise.all([
      contract.methods.minBurn(token).call(),
      contract.methods.maxBurn(token).call(),
    ]);

    return {
      min: Number(ethers.utils.formatUnits(results[0], decimals)),
      max: Number(ethers.utils.formatUnits(results[1], decimals)),
    };
  } catch (error: any) {
    console.error(error.message);
    return {
      min: 0,
      max: 0,
    };
  }
};
