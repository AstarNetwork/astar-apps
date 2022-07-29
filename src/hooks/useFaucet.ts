import axios from 'axios';
import { DateTime } from 'luxon';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { onUnmounted, ref, Ref, watch, watchEffect } from 'vue';
import { useAccount } from './useAccount';
import { useNetworkInfo } from './useNetworkInfo';

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

export function useFaucet(isModalFaucet?: Ref<boolean>) {
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
  const { currentNetworkIdx } = useNetworkInfo();

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

  const requestFaucet = async (recaptchaResponse: string): Promise<void> => {
    if (!currentAccount.value) {
      throw Error('Address is empty');
    }

    try {
      store.commit('general/setLoading', true);
      const endpoint = providerEndpoints[currentNetworkIdx.value].faucetEndpoint;
      if (!endpoint) {
        throw Error('Cannot find the request endpoint');
      }

      const url = `${endpoint}/drip`;
      const { data } = await axios.post<{ hash: string }>(url, {
        destination: currentAccount.value,
        recaptchaResponse,
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
    [hash, currentAccount, currentNetworkIdx, isModalFaucet],
    async () => {
      const currentAccountRef = currentAccount.value;
      const isModalFaucetRef = isModalFaucet && isModalFaucet.value;
      if (!currentAccountRef || !isModalFaucetRef) return;
      const endpoint = providerEndpoints[currentNetworkIdx.value].faucetEndpoint;

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
