import { showError } from 'src/modules/extrinsic';
import { ISubmittableResult } from '@polkadot/types/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { EthereumProvider } from './../types/CustomSignature';
import { supportEvmWalletObj, SupportWallet } from 'src/config/wallets';
import { web3Enable } from '@polkadot/extension-dapp';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateAccount } from './../../store/general/state';
import { deepLink } from 'src/links';
import { Dispatch } from 'vuex';

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

type Transaction = SubmittableExtrinsic<'promise', ISubmittableResult>;

export const signAndSend = async ({
  transaction,
  senderAddress,
  substrateAccounts,
  isCustomSignature = false,
  dispatch,
  txResHandler,
  handleCustomExtrinsic,
  finalizeCallback,
  tip = 1,
}: {
  transaction: Transaction;
  senderAddress: string;
  substrateAccounts: SubstrateAccount[];
  isCustomSignature: boolean;
  dispatch: Dispatch;
  txResHandler: (result: ISubmittableResult) => void;
  // from: useCustomSignature.ts
  handleCustomExtrinsic?: (method: Transaction) => Promise<void>;
  finalizeCallback?: () => void;
  tip?: number;
}): Promise<void> => {
  const sendSubstrateTransaction = async (): Promise<void> => {
    const injector = await getInjector(substrateAccounts);
    if (!injector) {
      throw Error('Invalid injector');
    }
    await transaction.signAndSend(
      senderAddress,
      {
        signer: injector.signer,
        nonce: -1,
        tip,
      },
      (result) => {
        txResHandler && txResHandler(result);
        finalizeCallback && finalizeCallback();
      }
    );
  };

  try {
    if (isCustomSignature && handleCustomExtrinsic) {
      await handleCustomExtrinsic(transaction);
      finalizeCallback && finalizeCallback();
    } else {
      await sendSubstrateTransaction();
    }
  } catch (error: any) {
    console.error(error.message);
    showError(dispatch, error.message);
  }
};
