import { ethers } from 'ethers';
import ABI from 'src/config/abi/ERC20.json';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { Erc20Token } from 'src/modules/token';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { blockExplorerUrls, CHAIN_INFORMATION } from 'src/config/web3';
import { getRandomFromArray } from 'src/hooks/helper/common';
import { EVM, nativeCurrency, TNetworkId } from 'src/config/web3';
export { buildEvmAddress, isValidEvmAddress, toSS58Address } from 'src/config/web3/utils/convert';
export { getBalance, sendNativeTokenTransaction } from 'src/config/web3/utils/transactions';

export const getChainData = (chainId: number) => {
  const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = CHAIN_INFORMATION;

  return {
    chainName: chainName[chainId],
    nativeCurrency: nativeCurrency[chainId],
    rpcUrls: rpcUrls[chainId],
    blockExplorerUrls: blockExplorerUrls[chainId],
  };
};

export const setupNetwork = async ({
  network,
  provider,
}: {
  network: number;
  provider: EthereumProvider;
}): Promise<boolean> => {
  if (provider) {
    const chainId = `0x${network.toString(16)}`;
    const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = getChainData(network);

    try {
      if (network === 1) {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [
            {
              chainId,
            },
          ],
        });
        return true;
      }

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

export const buildWeb3Instance = (chainId: EVM) => {
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
  const web3 = buildWeb3Instance(srcChainId);
  if (!web3) {
    throw Error(`Cannot create web3 instance with network id ${srcChainId}`);
  }
  const contract = new web3.eth.Contract(ABI as AbiItem[], tokenAddress);
  const [decimals, symbol] = await Promise.all([
    contract.methods.decimals().call(),
    contract.methods.symbol().call(),
  ]);
  return { decimals, symbol };
};

export const getTokenBal = async ({
  address,
  tokenAddress,
  srcChainId,
  tokenSymbol,
}: {
  address: string;
  tokenAddress: string;
  srcChainId: number;
  tokenSymbol?: string;
}): Promise<string> => {
  try {
    const web3 = buildWeb3Instance(srcChainId);
    if (!web3) {
      throw Error(`Cannot create web3 instance with network id ${srcChainId}`);
    }
    const contract = new web3.eth.Contract(ABI as AbiItem[], tokenAddress);

    const isCheckNativeBal = tokenSymbol && srcChainId;
    if (isCheckNativeBal && nativeCurrency[srcChainId].name === tokenSymbol) {
      const balance = await web3.eth.getBalance(address);
      return web3.utils.fromWei(balance, 'ether');
    }

    const decimals = await contract.methods.decimals().call();
    const balance = (await contract.methods.balanceOf(address).call()) ?? '0';
    const formattedBalance = ethers.utils.formatUnits(balance, decimals).toString();
    return formattedBalance;
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

    const data = {
      srcChainId,
      address,
      decimal,
      symbol,
      name,
      image: '',
      isWrappedToken: false,
      isXC20: isXc20Token(address),
      wrapUrl: null,
    };

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
