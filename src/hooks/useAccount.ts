import { computed, ref, watch } from 'vue';
import { useStore } from 'src/store';

export const useAccount = () => {
  const store = useStore();

  const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
  const isCheckMetamaskH160 = computed(() => store.getters['general/isCheckMetamaskH160']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const allAccounts = computed(() => store.getters['general/allAccounts']);
  const allAccountNames = computed(() => store.getters['general/allAccountNames']);
  const currentAccountIdx = computed(() => store.getters['general/accountIdx']);

  const currentAccount = ref('');
  const currentAccountName = ref('');

  watch(
    [allAccounts, allAccountNames, currentAccountIdx, isCheckMetamask, isCheckMetamaskH160],
    () => {
      if (allAccounts.value) {
        console.log('currentEcdsaAccount.value', currentEcdsaAccount.value);
        console.log('isCheckMetamask', isCheckMetamask.value);
        console.log('isCheckMetamaskH160', isCheckMetamaskH160.value);
        if (isCheckMetamask.value && currentEcdsaAccount.value) {
          currentAccount.value = currentEcdsaAccount.value.ss58;
          currentAccountName.value = 'ECDSA (Ethereum SS58)';
        } else if (isCheckMetamaskH160.value && currentEcdsaAccount.value) {
          currentAccount.value = currentEcdsaAccount.value.h160;
          currentAccountName.value = 'ECDSA (Ethereum H160)';
        } else {
          currentAccount.value = allAccounts.value[currentAccountIdx.value];
          currentAccountName.value = allAccountNames.value[currentAccountIdx.value];
        }
      }
    },
    { immediate: true }
  );

  return {
    allAccounts,
    allAccountNames,
    currentAccount,
    currentAccountName,
  };
};
