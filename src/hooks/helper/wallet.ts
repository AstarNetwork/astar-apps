import { EthereumProvider } from './../types/CustomSignature';
import { SupportWallet } from 'src/config/wallets';
import { web3Enable } from '@polkadot/extension-dapp';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateAccount } from './../../store/general/state';
import { deepLink } from 'src/links';

export const getInjectedExtensions = async (): Promise<any[]> => {
  const extensions = await web3Enable('AstarNetwork/astar-apps');
  // Memo: obtain the extension name
  // console.log('extensions', extensions);
  return extensions;
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

const getDeepLinkUrl = (wallet: SupportWallet) => {
  switch (wallet) {
    case SupportWallet.MetaMask:
      return deepLink.metamask;
    case SupportWallet.Math:
      return deepLink.mathwallet;

    default:
      return '';
  }
};

export const handleIsSubstrateDappBrowser = (wallet: SupportWallet): void => {
  const isDappBrowser =
    typeof window.injectedWeb3 !== 'undefined' &&
    window.injectedWeb3 &&
    window.injectedWeb3['polkadot-js'];

  if (isMobileDevice && !isDappBrowser) {
    const url = getDeepLinkUrl(wallet);
    window.open(url);
    return;
  }
};
