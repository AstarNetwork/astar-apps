import { ethers } from 'ethers';
import ABI from 'src/c-bridge/abi/ERC20.json';
import { AbiItem } from 'web3-utils';
import { endpointKey } from 'src/config/chainEndpoints';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import Web3 from 'web3';
import { blockExplorerUrls, CHAIN_INFORMATION } from '../index';
import { EVM, nativeCurrency, TNetworkId } from './../index';

export const getChainData = (chainId: number) => {
  const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = CHAIN_INFORMATION;

  return {
    chainName: chainName[chainId],
    nativeCurrency: nativeCurrency[chainId],
    rpcUrls: rpcUrls[chainId],
    blockExplorerUrls: blockExplorerUrls[chainId],
  };
};

export const setupNetwork = async (network: number): Promise<boolean> => {
  const provider = getEvmProvider();
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
      console.error('Failed to setup the network in Metamask:', error);
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
  }
  return EVM.SHIBUYA_TESTNET;
};

export const createAstarWeb3Instance = (currentNetworkIdx: TNetworkId) => {
  const chainId = getChainId(currentNetworkIdx);
  const network = getChainData(chainId);
  if (!network.rpcUrls[0]) return;

  return new Web3(new Web3.providers.HttpProvider(network.rpcUrls[0]));
};

export const buildWeb3Instance = (chainId: EVM) => {
  const network = getChainData(chainId);
  if (!network.rpcUrls[0]) return;
  return new Web3(new Web3.providers.HttpProvider(network.rpcUrls[0]));
};

export const getTokenBal = async ({
  address,
  tokenAddress,
  srcChainId,
  tokenSymbol,
}: {
  address: string;
  tokenAddress: string;
  srcChainId?: number;
  tokenSymbol?: string;
}): Promise<string> => {
  try {
    const provider = getEvmProvider();
    const web3 = new Web3(provider as any);
    const contract = new web3.eth.Contract(ABI as AbiItem[], tokenAddress);

    const isCheckNativeBal = tokenSymbol && srcChainId;
    if (isCheckNativeBal && nativeCurrency[srcChainId].name === tokenSymbol) {
      const balance = await web3.eth.getBalance(address);
      return web3.utils.fromWei(balance, 'ether');
    }

    const decimals = await contract.methods.decimals().call();
    const balance = (await contract.methods.balanceOf(address).call()) ?? '0';
    return ethers.utils.formatUnits(balance, decimals).toString();
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
