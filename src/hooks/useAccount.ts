import { SubstrateAccount } from './../store/general/state';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useStore } from 'src/store';
import { computed, ref, watch, watchEffect } from 'vue';

export const useAccount = () => {
  const store = useStore();

  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const currentAddress = computed(() => store.getters['general/selectedAddress']);
  const { SELECTED_ADDRESS } = LOCAL_STORAGE;

  const disconnectAccount = () => {
    store.commit('general/setCurrentAddress', null);
    store.commit('general/setIsH160Formatted', false);
    store.commit('general/setIsEthWallet', false);
    store.commit('general/setCurrentEcdsaAccount', {
      ethereum: '',
      ss58: '',
      h160: '',
    });
  };

  const currentAccount = ref<string>('');
  const currentAccountName = ref<string>('');

  watch(
    [isH160Formatted, currentEcdsaAccount],
    () => {
      if (currentEcdsaAccount.value.h160 || currentEcdsaAccount.value.ss58) {
        currentAccountName.value = 'Ethereum Extension';
        localStorage.setItem(SELECTED_ADDRESS, 'Ethereum Extension');
        store.commit('general/setIsEthWallet', true);

        const { ss58, h160 } = currentEcdsaAccount.value;
        const address = ss58 ? ss58 : h160;
        currentAccount.value = address;
        store.commit('general/setIsH160Formatted', h160 ? true : false);
        store.commit('general/setCurrentAddress', address);
        return;
      }

      currentAccount.value = '';
      currentAccountName.value = '';
    },
    { immediate: true }
  );

  watch(
    [currentAddress],
    () => {
      if (
        !substrateAccounts.value ||
        currentAddress.value === null ||
        currentEcdsaAccount.value.ethereum
      )
        return;
      const account = substrateAccounts.value.find(
        (it: SubstrateAccount) => it.address === currentAddress.value
      );
      if (!account) return;

      currentAccount.value = account.address;
      currentAccountName.value = account.name;
      localStorage.setItem(SELECTED_ADDRESS, String(currentAddress.value));
      store.commit('general/setIsEthWallet', false);
      store.commit('general/setIsH160Formatted', false);
      return;
    },
    { immediate: true }
  );

  watchEffect(() => {
    if (!currentEcdsaAccount.value.ethereum || !window.ethereum || !isH160Formatted.value) return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts[0] !== currentAccount.value) {
        disconnectAccount();
      }
    });
  });

  return {
    substrateAccounts,
    currentAccount,
    currentAccountName,
    disconnectAccount,
  };
};
