import { wait } from 'src/hooks/helper/common';
import { EthereumProvider } from './../types/CustomSignature';
import { supportEvmWalletObj, SupportWallet } from 'src/config/wallets';
import { web3Enable } from '@polkadot/extension-dapp';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateAccount } from './../../store/general/state';
import { deepLink } from 'src/links';

export const getInjectedExtensions = async (): Promise<any[]> => {
  const firstAccess = localStorage.getItem(LOCAL_STORAGE.FIRST_ACCESS);
  if (firstAccess !== null) {
    // Memo: Firefox takes some time to load the wallet extensions at the boot time.
    let extensions = await web3Enable('AstarNetwork/astar-apps');
    // Memo: obtain the extension name
    // console.log('extensions', extensions);

    const injectedWeb3 = window.injectedWeb3;
    const numWalletExtensions = injectedWeb3 ? Object.values(window.injectedWeb3).length : 0;
    const maxRetry = 20;
    let numRetry = 0;
    while (extensions.length !== numWalletExtensions) {
      wait(400);
      extensions = await web3Enable('AstarNetwork/astar-apps');
      numRetry++;
      if (numRetry > maxRetry) {
        break;
      }
    }

    return extensions;
  }
  return [];
};

export const getSelectedAccount = (accounts: SubstrateAccount[]) => {
  try {
    const selectedAddress = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
    if (selectedAddress === 'Ethereum Extension') {
      return undefined;
    }

    const account = accounts.find((it) => it.address === selectedAddress);
    return account;
  } catch (error: any) {
    console.error(error.message);
    return undefined;
  }
};

export const getInjector = async (accounts: SubstrateAccount[]) => {
  const account = getSelectedAccount(accounts);
  const extensions = await getInjectedExtensions();
  const injector = extensions.find((it) => it.name === account?.source);
  return injector;
};

export const isMobileDevice =
  'ontouchstart' in document.documentElement && navigator.userAgent.match(/Mobi/);

export const castMobileSource = (source: string) => {
  if (isMobileDevice) {
    // Memo: source as 'polkadot-js' in mobile app
    const polkadotJsWallets = [SupportWallet.Math, SupportWallet.Nova];
    if (polkadotJsWallets.find((it) => it === source)) {
      return SupportWallet.PolkadotJs;
    }
  }
  return source;
};

export const getEvmProvider = () => {
  // Todo: integrate with other wallet
  const metamaskProvider = typeof window !== 'undefined' && window.ethereum;
  return metamaskProvider;
};

export const addToMetamask = ({
  tokenAddress,
  symbol,
  decimals,
  image,
  provider,
}: {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  image: string;
  provider: EthereumProvider;
}) => {
  provider.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: tokenAddress,
        symbol,
        decimals,
        image,
      },
    },
  });
};

export const addToEvmWallet = ({
  tokenAddress,
  symbol,
  decimals,
  image,
}: {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  image: string;
}) => {
  const provider = getEvmProvider();
  if (!provider) return;
  addToMetamask({ tokenAddress, symbol, decimals, image, provider });
};

export const getDeepLinkUrl = (wallet: SupportWallet): string | false => {
  switch (wallet) {
    case SupportWallet.MetaMask:
      return deepLink.metamask;

    default:
      return false;
  }
};

export const checkIsWalletExtension = async (): Promise<boolean> => {
  const isSubstrateDappBrowser = await getInjectedExtensions();
  const isMetamask = typeof window.ethereum !== 'undefined';
  return Boolean(isSubstrateDappBrowser.length || isMetamask);
};

export const checkIsEthereumWallet = (wallet: SupportWallet) => {
  return supportEvmWalletObj.hasOwnProperty(wallet);
};

export const checkIsMobileMathWallet = async (): Promise<boolean> => {
  try {
    if (isMobileDevice) {
      const [wallet] = await getInjectedExtensions();
      const isMath = wallet.hasOwnProperty('isMathWallet');
      return isMath;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
