import axios from 'axios';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, ref, watch, onUnmounted, watchEffect } from 'vue';
import { getProviderIndex } from './../config/chainEndpoints';
import { useAccount } from './useAccount';
import { DateTime } from 'luxon';

interface Timestamps {
  lastRequestAt: number;
  nextRequestAt: number;
}

export interface FaucetInfo {
  timestamps: Timestamps;
  faucet: {
    amount: number;
    unit: string;
  };
}

interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
}

export function useFaucet() {
  const timestamps = ref<Timestamps | null>(null);
  const faucetAmount = ref<number>(0);
  const unit = ref<string>('');
  const isAbleToFaucet = ref<boolean>(false);
  const hash = ref<string>('');
  const isLoading = ref<boolean>(true);
  const countDown = ref<Countdown>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { currentAccount } = useAccount();
  const store = useStore();
  const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
  const chainInfo = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo : undefined;
  });

  const getFaucetInfo = async ({
    account,
    endpoint,
  }: {
    account: string;
    endpoint: string;
  }): Promise<FaucetInfo | false> => {
    const fetchData = async () => {
      try {
        isLoading.value = true;
        const url = `${endpoint}/drip/?destination=${account}`;
        const { data } = await axios.get(url);
        return data;
      } catch (error: any) {
        throw Error(error.message || 'Something went wrong');
      } finally {
        isLoading.value = false;
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
        return false;
      }
    }
  };

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

  const handleCountDown = (): void => {
    if (!timestamps.value) return;
    const { nextRequestAt } = timestamps.value;
    isAbleToFaucet.value = Date.now() > nextRequestAt;

    if (!isAbleToFaucet.value) {
      const resetTime = DateTime.fromMillis(nextRequestAt);
      const { hours, minutes, seconds } = resetTime.diffNow(['hours', 'minutes', 'seconds']);
      countDown.value.hours = hours;
      countDown.value.minutes = minutes;
      countDown.value.seconds = Number(seconds.toFixed(0));
    }
  };

  const updateCountdown = setInterval(() => {
    handleCountDown();
  }, 1000);

  watchEffect(() => {
    handleCountDown();
  });

  onUnmounted(() => {
    clearInterval(updateCountdown);
  });

  watch(
    [hash, currentAccount, chainInfo],
    async () => {
      const currentAccountRef = currentAccount.value;
      if (!currentAccountRef || isH160Formatted.value || !chainInfo.value) return;
      const currentNetworkIdx = getProviderIndex(chainInfo.value.chain);
      const endpoint = providerEndpoints[currentNetworkIdx].faucetEndpoint;

      const data = await getFaucetInfo({ account: currentAccountRef, endpoint });
      if (!data) return;

      faucetAmount.value = data.faucet.amount;
      unit.value = data.faucet.unit;
      timestamps.value = data.timestamps;
    },
    { immediate: true }
  );

  return {
    requestFaucet,
    isLoading,
    faucetAmount,
    unit,
    isAbleToFaucet,
    countDown,
  };
}
