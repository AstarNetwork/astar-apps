import { TNetworkId, EVM } from './../index';
import Web3 from 'web3';
import { CHAIN_INFORMATION } from '..';
import { endpointKey } from 'src/config/chainEndpoints';

export const getChainData = (chainId: 336 | 81) => {
  const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = CHAIN_INFORMATION;

  return {
    chainName: chainName[chainId],
    nativeCurrency: nativeCurrency[chainId],
    rpcUrls: rpcUrls[chainId],
    blockExplorerUrls: blockExplorerUrls[chainId],
  };
};

export const setupNetwork = async (network: 336 | 81): Promise<boolean> => {
  const provider = typeof window !== 'undefined' && window.ethereum;
  if (provider) {
    const chainId = `0x${network.toString(16)}`;
    const { chainName, nativeCurrency, rpcUrls, blockExplorerUrls } = getChainData(network);
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
      return true;
    } catch (error) {
      console.error('Failed to setup the network in Metamask:', error);
      return false;
    }
  }
  return false;
};

export const getChainId = (
  currentNetworkIdx: TNetworkId
): EVM.SHIDEN_MAINNET | EVM.SHIDEN_TESTNET => {
  if (currentNetworkIdx === endpointKey.SHIDEN) {
    return EVM.SHIDEN_MAINNET;
  }
  return EVM.SHIDEN_TESTNET;
};

export const createWeb3Instance = async (currentNetworkIdx: TNetworkId) => {
  const chainId = getChainId(currentNetworkIdx);
  const network = getChainData(chainId);
  return new Web3(new Web3.providers.HttpProvider(network.rpcUrls[0]));
};
