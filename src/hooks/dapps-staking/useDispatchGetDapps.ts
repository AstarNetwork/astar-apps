import { useAccount, useNetworkInfo } from 'src/hooks';
import { wait } from '@astar-network/astar-sdk-core';
import { useStore } from 'src/store';
import { computed, watch } from 'vue';

export function useDispatchGetDapps() {
  const store = useStore();
  const { currentNetworkName } = useNetworkInfo();
  const { currentAccount } = useAccount();
  const dapps = computed(() => store.getters['dapps/getAllDapps']);

  // Memo: invoke this function whenever the users haven't connect to wallets
  const getDappsForBrowser = async (): Promise<void> => {
    // Memo (4 secs): quick hack for waiting for updating `currentAccount` state from the initial state.
    // Fixme: this isn't an elegant solution.
    await wait(4000);

    const isBrowsingOnly = !!(
      dapps.value.length === 0 &&
      !currentAccount.value &&
      currentNetworkName.value
    );

    if (isBrowsingOnly) {
      store.dispatch('dapps/getDapps', {
        network: currentNetworkName.value.toLowerCase(),
        currentAccount: '',
      });
    }
  };

  const getDapps = async (): Promise<void> => {
    console.log('currentAccount', currentAccount.value);
    const isConnectedWallet = currentNetworkName.value && currentAccount.value;
    // if (isConnectedWallet && dapps.value.length === 0) {
    if (isConnectedWallet) {
      const address = !currentAccount.value ? '' : currentAccount.value;
      console.log('address', address);
      store.dispatch('dapps/getDapps', {
        network: currentNetworkName.value.toLowerCase(),
        currentAccount: address,
      });
    } else {
      getDappsForBrowser();
    }
  };

  watch([currentAccount, currentNetworkName], getDapps);
}
