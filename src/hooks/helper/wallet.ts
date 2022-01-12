import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SubstrateAccount } from './../../store/general/state';

export const getSelectedAccount = (accounts: SubstrateAccount[]) => {
  try {
    const selectedAddress = localStorage.getItem(LOCAL_STORAGE.SELECTED_ACCOUNT_ID);
    if (selectedAddress === 'Ethereum Extension') {
      return undefined;
    }

    const account = accounts.find((it) => it.address === selectedAddress);
    return account;
  } catch (error) {
    return undefined;
  }
};
