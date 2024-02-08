import { getRandomFromArray, hasProperty } from '@astar-network/astar-sdk-core';
import axios from 'axios';
import { ethers } from 'ethers';
import ABI from 'src/config/abi/ERC20.json';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import {
  CHAIN_INFORMATION,
  EVM,
  TNetworkId,
  blockExplorerUrls,
  nativeCurrency,
} from 'src/config/web3';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { Erc20Token, tokenImageMap } from 'src/modules/token';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { ZkChainId, getBridgedTokenAddress } from 'src/modules/zk-evm-bridge';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export const getChainData = (chainId: number) => {
  const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = CHAIN_INFORMATION;

  return {
    chainName: chainName[chainId],
    nativeCurrency: nativeCurrency[chainId],
    rpcUrls: rpcUrls[chainId],
    blockExplorerUrls: blockExplorerUrls[chainId],
  };
};

export const buildErc20Contract = ({
  tokenAddress,
  srcChainId,
}: {
  tokenAddress: string;
  srcChainId: EVM;
}): Contract => {
  const web3 = buildWeb3Instance(srcChainId);
  if (!web3) {
    throw Error(`Cannot create web3 instance with network id ${srcChainId}`);
  }
  return new web3.eth.Contract(ABI as AbiItem[], tokenAddress);
};

export const setupNetwork = async ({
  network,
  provider,
}: {
  network: number;
  provider: EthereumProvider;
}): Promise<boolean> => {
  if (network === Number(provider.chainId)) return true;
  if (provider) {
    const chainId = `0x${network.toString(16)}`;
    const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = getChainData(network);

    try {
      if (chainId !== provider.chainId) {
        // Memo:
        // 1. Try to switch the network
        // 2. Add the network into the wallet if there hasn't registered the network on the wallet yet
        // 2a. Avoid duplicating changing network request if users reject the request
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
          });
        } catch (error: any) {
          const codeUserRejected = 4001;
          if (error.code !== codeUserRejected) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId,
                    chainName,
                    nativeCurrency,
                    rpcUrls,
                    blockExplorerUrls,
                  },
                ],
              });
            } catch (error) {
              console.error(error);
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to setup the network in EVM extension:', error);
      return false;
    }
  }
  return false;
};

export const getChainId = (currentNetworkIdx: endpointKey): number => {
  if (currentNetworkIdx === endpointKey.SHIDEN) {
    return EVM.SHIDEN_MAINNET;
  } else if (currentNetworkIdx === endpointKey.ASTAR) {
    return EVM.ASTAR_MAINNET;
  } else if (currentNetworkIdx === endpointKey.LOCAL) {
    return EVM.ASTAR_LOCAL_NODE;
  } else if (currentNetworkIdx === endpointKey.ASTAR_ZKEVM) {
    return EVM.ASTAR_ZKEVM_MAINNET;
  } else if (currentNetworkIdx === endpointKey.ZKATANA) {
    return EVM.ZKATANA_TESTNET;
  }
  return EVM.SHIBUYA_TESTNET;
};

export const createAstarWeb3Instance = async (currentNetworkIdx: TNetworkId) => {
  const chainId = getChainId(currentNetworkIdx);
  const network = getChainData(chainId);
  const endpoints = providerEndpoints[currentNetworkIdx].evmEndpoints;
  const endpoint = getRandomFromArray(endpoints);
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
    const blockHeight = await web3.eth.getBlockNumber();
    if (blockHeight > 0) {
      return web3;
    } else {
      throw Error(`${network.rpcUrls[0]} is not working`);
    }
  } catch (error) {
    console.error(error);
    if (endpoints.length > 1) {
      const filteredEndpoints = endpoints.filter((it) => it !== endpoint);
      const fallbackEndpoint = getRandomFromArray(filteredEndpoints);
      return new Web3(new Web3.providers.HttpProvider(fallbackEndpoint));
    } else {
      return new Web3(new Web3.providers.HttpProvider(endpoint));
    }
  }
};

export const buildWeb3Instance = (chainId: EVM | ZkChainId) => {
  const network = getChainData(chainId);
  if (!network.rpcUrls[0]) return;
  return new Web3(new Web3.providers.HttpProvider(network.rpcUrls[0]));
};

export const getTokenDetails = async ({
  tokenAddress,
  srcChainId,
}: {
  tokenAddress: string;
  srcChainId: number;
}): Promise<{ decimals: string; symbol: string }> => {
  const contract = buildErc20Contract({ tokenAddress, srcChainId });
  const [decimals, symbol] = await Promise.all([
    contract.methods.decimals().call(),
    contract.methods.symbol().call(),
  ]);
  return { decimals, symbol };
};

export const getNativeBalance = async ({
  address,
  srcChainId,
  web3,
}: {
  address: string;
  srcChainId: number;
  web3?: Web3;
}): Promise<string> => {
  const web3Provider = web3 ? web3 : buildWeb3Instance(srcChainId);
  const bal = await web3Provider!.eth.getBalance(address);
  return web3Provider!.utils.fromWei(bal, 'ether');
};

export const getTokenBal = async ({
  address,
  tokenAddress,
  srcChainId,
  tokenSymbol,
  isNativeToken,
}: {
  address: string;
  tokenAddress: string;
  srcChainId: number;
  tokenSymbol?: string;
  isNativeToken?: boolean;
}): Promise<string> => {
  try {
    const web3 = buildWeb3Instance(srcChainId);
    if (!web3) {
      throw Error(`Cannot create web3 instance with network id ${srcChainId}`);
    }

    const isCheckNativeBal = isNativeToken || tokenAddress === astarNativeTokenErcAddr;
    if (isCheckNativeBal && nativeCurrency[srcChainId].symbol === tokenSymbol) {
      return await getNativeBalance({ address, srcChainId, web3 });
    } else {
      const code = await web3.eth.getCode(tokenAddress);
      const isTokenExist = code !== '0x';
      if (!isTokenExist) {
        return '0';
      }
      const contract = new web3.eth.Contract(ABI as AbiItem[], tokenAddress);
      const decimals = await contract.methods.decimals().call();
      const balance = (await contract.methods.balanceOf(address).call()) ?? '0';
      const formattedBalance = ethers.utils.formatUnits(balance, decimals).toString();
      return formattedBalance;
    }
  } catch (error: any) {
    console.error(error.message);
    return '0';
  }
};

export const getTokenExplorer = ({
  chainId,
  address,
}: {
  chainId: number;
  address: string;
}): string => {
  switch (chainId) {
    case EVM.ASTAR_MAINNET:
      return blockExplorerUrls[EVM.ASTAR_MAINNET] + `/address/${address}`;
    case EVM.SHIDEN_MAINNET:
      return blockExplorerUrls[EVM.SHIDEN_MAINNET] + `/address/${address}`;
    case EVM.SHIBUYA_TESTNET:
      return blockExplorerUrls[EVM.SHIBUYA_TESTNET] + `/address/${address}`;

    default:
      return blockExplorerUrls[chainId] + `/token/${address}`;
  }
};

export const isXc20Token = (address: string): boolean => {
  const addr = address.toLowerCase();
  return addr.slice(0, 10) === '0xffffffff';
};

export const getTokenImage = async ({ symbol, address }: { symbol: string; address: string }) => {
  const isRegisteredToken = hasProperty(tokenImageMap, symbol);
  if (isRegisteredToken) {
    return tokenImageMap[symbol as keyof typeof tokenImageMap];
  }

  // Memo: get the token image by Ethereum contract address
  const trustWalletLogoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  try {
    await axios.get(trustWalletLogoUrl);
    return trustWalletLogoUrl;
  } catch (error) {
    return '';
  }
};

export const fetchErc20TokenInfo = async ({
  web3,
  address,
  srcChainId,
}: {
  web3: Web3;
  address: string;
  srcChainId: number;
}): Promise<Erc20Token | null> => {
  try {
    const contract = new web3.eth.Contract(ABI as AbiItem[], address);
    const [decimal, name, symbol] = await Promise.all([
      contract.methods.decimals().call(),
      contract.methods.name().call(),
      contract.methods.symbol().call(),
    ]);

    const isZkEvm = srcChainId === ZkChainId.AstarZk || srcChainId === ZkChainId.Zkatana;

    let bridgedTokenAddress = '';
    let toChainId;
    let image = '';
    if (isZkEvm) {
      toChainId = srcChainId === ZkChainId.AstarZk ? ZkChainId.Ethereum : ZkChainId.Sepolia;
      bridgedTokenAddress = await getBridgedTokenAddress({
        srcChainId,
        tokenAddress: address,
        name,
        symbol,
        decimal,
      });
      image = await getTokenImage({ symbol, address: bridgedTokenAddress });
    }

    const data: Erc20Token = {
      srcChainId,
      address,
      decimal,
      symbol,
      name,
      image,
      isWrappedToken: false,
      isXC20: isXc20Token(address),
      wrapUrl: null,
      bridgedChainId: toChainId,
      bridgedTokenAddress,
    };

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getTransactionTimestamp = async ({
  web3,
  transactionHash,
}: {
  web3: Web3;
  transactionHash: string;
}): Promise<number> => {
  const transaction = await web3.eth.getTransaction(transactionHash);
  if (!transaction || !transaction.blockNumber) {
    console.error('Transaction not found', transaction);
    return 0;
  }

  const block = await web3.eth.getBlock(transaction.blockNumber);
  return Number(block.timestamp);
};

export const checkAllowance = async ({
  senderAddress,
  contractAddress,
  tokenAddress,
  srcChainId,
}: {
  senderAddress: string;
  contractAddress: string;
  tokenAddress: string;
  srcChainId: EVM;
}): Promise<string> => {
  const contract = buildErc20Contract({ tokenAddress, srcChainId });
  const allowance = await contract.methods.allowance(senderAddress, contractAddress).call();
  return allowance;
};
