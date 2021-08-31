//@deprecated
import { reactive, toRefs, watch, watchEffect, computed, Ref } from 'vue';
import { keyring } from '@polkadot/ui-keyring';
import { useStore } from 'src/store';

interface UseAccounts {
  allAccounts: string[];
  allAccountNames: string[];
  defaultAccount: string;
  defaultAccountName: string;
  defaultShortenAddress: string;
  hasAccounts: boolean;
  isAccount: (address: string) => boolean;
}

export const useAccount = (currentAccount: Ref<string>, currentAccountName: Ref<string>) => {
  const store = useStore();

  const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const currentAccountIdx = computed(() => store.getters['general/accountIdx']);

  const state = reactive<UseAccounts>({
    allAccounts: [],
    allAccountNames: [],
    defaultAccount: '',
    defaultAccountName: '',
    defaultShortenAddress: '',
    hasAccounts: false,
    isAccount: () => false,
  });

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
      state.defaultShortenAddress = state.defaultAccount.length > 0
        ? `${state.defaultAccount.slice(0, 6)}${'.'.repeat(6)}${state.defaultAccount.slice(-6)}`
        : '';
      state.hasAccounts = state.allAccounts.length !== 0;
      state.isAccount = (address: string) =>
        state.allAccounts.includes(address);
    });

    onInvalidate(() => {
      subscription.unsubscribe();
    });
  });

  watch(
    currentAccountIdx,
    () => {
      currentAccount.value = state.allAccounts[currentAccountIdx.value];
      currentAccountName.value =
        state.allAccountNames[currentAccountIdx.value];
    },
    { immediate: true }
  );

  watch(
    isCheckMetamask,
    () => {
      if (isCheckMetamask.value && currentEcdsaAccount.value) {
        currentAccount.value = currentEcdsaAccount.value.ss58;
        currentAccountName.value = 'ECDSA (Ethereum Extension)';
      } else {
        currentAccount.value = state.allAccounts[currentAccountIdx.value];
        currentAccountName.value =
          state.allAccountNames[currentAccountIdx.value];
      }
    },
    { immediate: true }
  )

  return toRefs(state);
};
