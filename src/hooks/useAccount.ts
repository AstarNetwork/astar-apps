import { computed, ref, watch } from 'vue';
import { useStore } from 'src/store';

export const useAccount = () => {
  const store = useStore();

  const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const allAccounts = computed(() => store.getters['general/allAccounts']);
  const allAccountNames = computed(() => store.getters['general/allAccountNames']);
  const currentAccountIdx = computed(() => store.getters['general/accountIdx']);

  const disconnectAccount = () => {
    store.commit('general/setCurrentAccountIdx', null);
    store.commit('general/setIsH160Formatted', false);
    store.commit('general/setIsCheckMetamask', false);
    store.commit('general/setCurrentEcdsaAccount', {
      ethereum: '',
      ss58: '',
      h160: '',
    });
  };

  const currentAccount = ref('');
  const currentAccountName = ref('');

  watch(
    [isCheckMetamask, isH160Formatted, currentEcdsaAccount],
    () => {
      if (!allAccounts.value) return;

      if (isCheckMetamask.value && currentEcdsaAccount.value) {
        currentAccount.value = currentEcdsaAccount.value.ss58;
        currentAccountName.value = 'Ethereum Extension';
        return;
      }
      if (isH160Formatted.value && currentEcdsaAccount.value) {
        currentAccount.value = currentEcdsaAccount.value.h160;
        currentAccountName.value = 'Ethereum Extension';
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
      return;
    },
    { immediate: true }
  );

  return {
    allAccounts,
    allAccountNames,
    currentAccount,
    currentAccountName,
    disconnectAccount,
  };
};
