import { web3Enable } from '@polkadot/extension-dapp';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateAccount } from './../../store/general/state';

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
