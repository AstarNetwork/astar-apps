import { reactive, toRefs, watchEffect } from 'vue';
import { keyring } from '@polkadot/ui-keyring';

interface UseAccounts {
  allAccounts: string[];
  allAccountNames: string[];
  defaultAccount: string;
  defaultAccountName: string;
  hasAccounts: boolean;
  isAccount: (address: string) => boolean;
}

export const useAccount = () => {
  const state = reactive<UseAccounts>({
    allAccounts: [],
    allAccountNames: [],
    defaultAccount: '',
    defaultAccountName: '',
    hasAccounts: false,
    isAccount: () => false,
  });

  const accounts = keyring.getAccounts();
  console.log('accounts', accounts);
  // accounts.forEach(({ address, meta, publicKey }) =>
  //   console.log(address, JSON.stringify(meta), u8aToHex(publicKey))
  // );

  watchEffect((onInvalidate) => {
    const subscription = keyring.accounts.subject.subscribe((accounts) => {
      state.allAccounts = accounts ? Object.keys(accounts) : [];
      state.allAccountNames = accounts
        ? Object.values(accounts).map((obj) => obj.option.name)
        : [];
      state.defaultAccount =
        state.allAccounts.length > 0 ? Object.keys(accounts)[0] : '';
      state.defaultAccountName =
        state.allAccounts.length > 0
          ? Object.values(accounts)[0].option.name
          : '';
      state.hasAccounts = state.allAccounts.length !== 0;
      state.isAccount = (address: string) =>
        state.allAccounts.includes(address);
    });

    onInvalidate(() => {
      subscription.unsubscribe();
    });
  });

  return toRefs(state);
};
