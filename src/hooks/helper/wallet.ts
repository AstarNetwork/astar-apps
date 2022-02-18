import { SupportWallet } from 'src/config/wallets';
import { web3Enable } from '@polkadot/extension-dapp';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateAccount } from './../../store/general/state';

export const sendBot = async (msg: string) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    const BOT_URL = 'https://astar-network-api.vercel.app/api/v1/sendBot';
    const body = JSON.stringify({
      msg,
    });

    await fetch(BOT_URL, {
      method: 'POST',
      body,
      headers,
    });
    return;
  } catch (error) {
    console.log(error);
  }
};

// [{"name":"polkadot-js","version":"0.10.1","originName":"AstarNetwork/astar-apps","isMathWallet":true,"accounts":{},"signer":{}}]

export const getInjectedExtensions = async (): Promise<any[]> => {
  const extensions = await web3Enable('AstarNetwork/astar-apps');
  // Memo: obtain the extension name
  console.log('extensions', extensions);
  const extentionsMsg = JSON.stringify(extensions);
  console.log('extentionsMsg', extentionsMsg);
  await sendBot(extentionsMsg);
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
