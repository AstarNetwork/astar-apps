import { useStore } from 'src/store';
import axios from 'axios';
import { ref, watch } from 'vue';
import { useAccount } from './useAccount';
import { providerEndpoints } from 'src/config/chainEndpoints';
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
  const { currentAccount } = useAccount();
  const store = useStore();
  const currentNetworkIdx = Number(localStorage.getItem('networkIdx'));
  const faucetEndpoint = providerEndpoints[currentNetworkIdx].faucetEndpoint;

  const getFaucetInfo = async (account: string): Promise<FaucetInfo> => {
    try {
      const url = `${faucetEndpoint}/drip/?destination=${account}`;
      const { data } = await axios.get(url);

      return data;
    } catch (error) {
      console.error(error);
      return initialInfoState;
    }
  };

  watch(
    [hash, currentAccount],
    async () => {
      const currentAccountRef = currentAccount.value;
      if (!currentAccountRef) return;

      faucetInfo.value = await getFaucetInfo(currentAccountRef);
    },
    { immediate: true }
  );

  const requestFaucet = async (): Promise<void> => {
    if (!currentAccount.value) {
      throw Error('Address is empty');
    }

    try {
      store.commit('general/setLoading', true);

      const url = `${faucetEndpoint}/drip`;
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
  };
}
