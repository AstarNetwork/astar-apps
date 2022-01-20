import { getProviderIndex } from './../config/chainEndpoints';
import { useStore } from 'src/store';
import axios from 'axios';
import { ref, watch, computed } from 'vue';
import { useAccount } from './useAccount';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
export interface FaucetInfo {
  timestamps: {
    lastRequestAt: number;
    nextRequestAt: number;
  };
  faucet: {
    amount: number;
    unit: string;
  };
}

const initialInfoState = {
  timestamps: {
    lastRequestAt: 0,
    nextRequestAt: 3600000,
  },
  faucet: {
    amount: 0.002,
    unit: 'SBY',
  },
};

export function useFaucet() {
  const faucetInfo = ref<FaucetInfo>(initialInfoState);
  const hash = ref<string>('');
  const isLoading = ref<boolean>(false);
  const { currentAccount } = useAccount();
  const store = useStore();
  const chainInfo = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo : undefined;
  });
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);

  const isAstar = computed(() => {
    const networkIdx = store.getters['general/networkIdx'];
    return networkIdx === endpointKey.ASTAR;
  });

  const getFaucetInfo = async ({
    account,
    endpoint,
  }: {
    account: string;
    endpoint: string;
  }): Promise<FaucetInfo> => {
    const fetchData = async () => {
      try {
        isLoading.value = true;

        // Todo: add a faucet for Astar network later
        if (isAstar.value) return;

        const url = `${endpoint}/drip/?destination=${account}`;
        const { data } = await axios.get(url);
        isLoading.value = false;
        return data;
      } catch (error: any) {
        throw Error(error.message || 'Something went wrong');
      }
    };

    try {
      return await fetchData();
    } catch (error) {
      // Memo: Recursion
      try {
        return await fetchData();
      } catch (error: any) {
        console.error(error.message);
        return initialInfoState;
      }
    }
  };

  watch(
    [hash, currentAccount, chainInfo],
    async () => {
      const currentAccountRef = currentAccount.value;
      if (!currentAccountRef || isH160Formatted.value || !chainInfo.value) return;
      const currentNetworkIdx = getProviderIndex(chainInfo.value.chain);
      const endpoint = providerEndpoints[currentNetworkIdx].faucetEndpoint;

      faucetInfo.value = await getFaucetInfo({ account: currentAccountRef, endpoint });
    },
    { immediate: true }
  );

  const requestFaucet = async (): Promise<void> => {
    if (!currentAccount.value) {
      throw Error('Address is empty');
    }

    try {
      store.commit('general/setLoading', true);
      const currentNetworkIdx = getProviderIndex(chainInfo.value.chain);
      const endpoint = providerEndpoints[currentNetworkIdx].faucetEndpoint;
      if (!endpoint) {
        throw Error('Cannot find the request endpoint');
      }

      const url = `${endpoint}/drip`;
      const { data } = await axios.post<{ hash: string }>(url, {
        destination: currentAccount.value,
      });

      const msg = `Completed at block hash #${data.hash}`;
      store.dispatch('general/showAlertMsg', {
        msg,
        alertType: 'success',
      });
      hash.value = data.hash;
    } catch (e: any) {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: `Transaction failed with error: ${e.message}`,
        alertType: 'error',
      });
    } finally {
      store.commit('general/setLoading', false);
    }
  };

  return {
    faucetInfo,
    requestFaucet,
    isLoading,
  };
}
