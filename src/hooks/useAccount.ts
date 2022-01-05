import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';

export const useAccount = () => {
  const store = useStore();

  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const allAccounts = computed(() => store.getters['general/allAccounts']);
  const allAccountNames = computed(() => store.getters['general/allAccountNames']);
  const currentAccountIdx = computed(() => store.getters['general/accountIdx']);
  const { SELECTED_ACCOUNT_ID } = LOCAL_STORAGE;

  const disconnectAccount = () => {
    store.commit('general/setCurrentAccountIdx', null);
    store.commit('general/setIsH160Formatted', false);
    store.commit('general/setIsCheckMetamask', false);
    store.commit('general/setCurrentEcdsaAccount', {
      ethereum: '',
      ss58: '',
      h160: '',
    });
    localStorage.removeItem(SELECTED_ACCOUNT_ID);
  };

  const currentAccount = ref<string>('');
  const currentAccountName = ref<string>('');

  watch(
    [isH160Formatted, currentEcdsaAccount],
    () => {
      if (!allAccounts.value) return;
      if (isH160Formatted.value && currentEcdsaAccount.value.h160) {
        currentAccount.value = currentEcdsaAccount.value.h160;
        currentAccountName.value = 'Ethereum Extension';
        localStorage.setItem(SELECTED_ACCOUNT_ID, 'Ethereum Extension');
        return;
      }
      currentAccount.value = '';
      currentAccountName.value = '';
    },
    { immediate: true }
  );

  watch(
    [currentAccountIdx],
    () => {
      if (!allAccounts.value || currentAccountIdx.value === null) return;

      currentAccount.value = allAccounts.value[currentAccountIdx.value];
      currentAccountName.value = allAccountNames.value[currentAccountIdx.value];
      localStorage.setItem(SELECTED_ACCOUNT_ID, String(currentAccountIdx.value));
      return;
    },
    { immediate: true }
  );

  watchEffect(() => {
    if (!currentEcdsaAccount.value || !window.ethereum) return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts[0] !== currentAccount.value) {
        disconnectAccount();
      }
    });
  });

  return {
    allAccounts,
    allAccountNames,
    currentAccount,
    currentAccountName,
    disconnectAccount,
  };
};
