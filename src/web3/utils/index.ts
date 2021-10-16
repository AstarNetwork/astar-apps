import { CHAIN_INFORMATION } from '..';

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

export const getChainId = (currentNetworkIdx: 1 | 3): 336 | 81 => {
  if (currentNetworkIdx === 1) {
    return 336;
  }
  return 81;
};
