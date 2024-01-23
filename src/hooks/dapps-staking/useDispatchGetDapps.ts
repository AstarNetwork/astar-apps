import { wait } from '@astar-network/astar-sdk-core';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { useDappStaking } from 'src/staking-v3';
import { useStore } from 'src/store';
import { computed, watch } from 'vue';

export function useDispatchGetDapps() {
  const store = useStore();
  const { isZkEvm, networkNameSubstrate } = useNetworkInfo();
  const { senderSs58Account } = useAccount();
  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const { isDappStakingV3 } = useDappStaking();

  // Memo: invoke this function whenever the users haven't connect to wallets
  const getDappsForBrowser = async (): Promise<void> => {
    // Memo (4 secs): quick hack for waiting for updating `currentAccount` state from the initial state.
    // Fixme: this isn't an elegant solution.
    await wait(4000);

    const isBrowsingOnly = !!(
      dapps.value.length === 0 &&
      !senderSs58Account.value &&
      networkNameSubstrate.value
    );

    if (isBrowsingOnly || isZkEvm.value) {
      store.dispatch('dapps/getDapps', {
        network: networkNameSubstrate.value.toLowerCase(),
        senderSs58Account: '',
      });
    }
  };

  const getDapps = async (): Promise<void> => {
    if (isDappStakingV3.value) {
      return;
    }

    const isConnectedWallet = networkNameSubstrate.value && senderSs58Account.value;
    if (isConnectedWallet && !isZkEvm.value) {
      const address = !senderSs58Account.value ? '' : senderSs58Account.value;
      store.dispatch('dapps/getDapps', {
        network: networkNameSubstrate.value.toLowerCase(),
        senderSs58Account: address,
      });
    } else {
      getDappsForBrowser();
    }
  };

  watch([senderSs58Account, networkNameSubstrate], getDapps, { immediate: true });
}
