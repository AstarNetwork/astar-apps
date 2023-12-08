import { $api } from 'boot/api';
import axios from 'axios';
import { DateTime } from 'luxon';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { onUnmounted, ref, Ref, watch, watchEffect, computed } from 'vue';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { ethers } from 'ethers';
import { fetchNativeBalance } from '@astar-network/astar-sdk-core';

interface Timestamps {
  lastRequestAt: number;
  nextRequestAt: number;
}

export interface FaucetInfo {
  timestamps: Timestamps;
  faucet: {
    amount: number;
    unit: string;
    faucetAddress: string;
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
  const faucetBalRequirement = computed<number>(() => faucetAmount.value / 2);
  const unit = ref<string>('');
  const isAbleToFaucet = ref<boolean>(false);
  const hash = ref<string>('');
  const isLoading = ref<boolean>(true);
  const faucetHotWalletBalance = ref<string>('0');
  const countDown = ref<Countdown>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { senderSs58Account } = useAccount();
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
    if (!senderSs58Account.value) {
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
        destination: senderSs58Account.value,
        recaptchaResponse,
      });

      const msg = `Completed at block hash #${data.hash}`;
      store.dispatch('general/showAlertMsg', {
        msg,
        alertType: 'success',
        txHash: data.hash,
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
    [hash, senderSs58Account, currentNetworkIdx, isModalFaucet],
    async () => {
      const senderSs58AccountRef = senderSs58Account.value;
      const isModalFaucetRef = isModalFaucet && isModalFaucet.value;
      if (!senderSs58AccountRef || faucetAmount.value > 0) return;
      const endpoint = providerEndpoints[currentNetworkIdx.value].faucetEndpoint;

      const data = await getFaucetInfo({ account: senderSs58AccountRef, endpoint });
      if (!data) return;
      const hotWalletBal = await fetchNativeBalance({
        address: data.faucet.faucetAddress,
        api: $api!,
      });

      faucetAmount.value = data.faucet.amount;
      unit.value = data.faucet.unit;
      timestamps.value = data.timestamps;
      faucetHotWalletBalance.value = ethers.utils.formatEther(hotWalletBal);
    },
    { immediate: false }
  );

  return {
    requestFaucet,
    isLoading,
    faucetAmount,
    unit,
    isAbleToFaucet,
    countDown,
    faucetHotWalletBalance,
    faucetBalRequirement,
  };
}
