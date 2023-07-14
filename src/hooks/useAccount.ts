import { isValidEvmAddress, toSS58Address, wait } from '@astar-network/astar-sdk-core';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { SubstrateAccount } from 'src/store/general/state';

export const ETHEREUM_EXTENSION = 'Ethereum Extension';

// Memo: Gives some time for syncing
const DELAY = 100;

export const useAccount = () => {
  const store = useStore();

  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const currentAddress = computed(() => store.getters['general/selectedAddress']);

  // Memo: converts EVM wallet address to SS58 for dApp staking queries
  const senderSs58Account = computed<string>(() => {
    return isValidEvmAddress(currentAccount.value)
      ? toSS58Address(currentAccount.value)
      : currentAccount.value;
  });
  const { SELECTED_ADDRESS, SELECTED_WALLET } = LOCAL_STORAGE;

  const disconnectAccount = async (): Promise<Boolean> => {
    return await new Promise(async (resolve) => {
      await wait(DELAY);
      store.commit('general/setCurrentAddress', null);
      store.commit('general/setIsH160Formatted', false);
      store.commit('general/setIsEthWallet', false);
      store.commit('dapps/setClaimedRewardsAmount', 0);
      store.commit('general/setCurrentWallet', '');
      store.commit('general/setCurrentEcdsaAccount', {
        ethereum: '',
        ss58: '',
        h160: '',
      });
      localStorage.removeItem(SELECTED_ADDRESS);
      localStorage.removeItem(SELECTED_WALLET);
      currentAccount.value = '';
      currentAccountName.value = '';
      resolve(true);
    });
  };

  const currentAccount = ref<string>('');
  const currentAccountName = ref<string>('');

  watch(
    [isH160Formatted, currentEcdsaAccount],
    () => {
      if (currentEcdsaAccount.value.h160 || currentEcdsaAccount.value.ss58) {
        currentAccountName.value = ETHEREUM_EXTENSION;
        localStorage.setItem(SELECTED_ADDRESS, ETHEREUM_EXTENSION);
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
    [currentAddress, substrateAccounts],
    async () => {
      await wait(DELAY);
      if (
        !substrateAccounts.value ||
        currentAddress.value === null ||
        currentAddress.value === '' ||
        currentEcdsaAccount.value.ethereum
      ) {
        return;
      }
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

  return {
    substrateAccounts,
    currentAccount,
    currentAccountName,
    senderSs58Account,
    disconnectAccount,
  };
};
