import { wait } from '@astar-network/astar-sdk-core';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, watch } from 'vue';

export function useDispatchGetDapps() {
  const store = useStore();
  const { isZkEvm, networkNameSubstrate } = useNetworkInfo();
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
      networkNameSubstrate.value
    );

    if (isBrowsingOnly || isZkEvm.value) {
      store.dispatch('dapps/getDapps', {
        network: networkNameSubstrate.value.toLowerCase(),
        currentAccount: '',
      });
    }
  };

  const getDapps = async (): Promise<void> => {
    const isConnectedWallet = networkNameSubstrate.value && currentAccount.value;
    if (isConnectedWallet && !isZkEvm.value) {
      const address = !currentAccount.value ? '' : currentAccount.value;
      store.dispatch('dapps/getDapps', {
        network: networkNameSubstrate.value.toLowerCase(),
        currentAccount: address,
      });
    } else {
      getDappsForBrowser();
    }
  };

  watch([currentAccount, networkNameSubstrate], getDapps);
}
