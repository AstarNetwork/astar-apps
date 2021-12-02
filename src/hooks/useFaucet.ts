import { ref, watch, onUnmounted, watchEffect } from 'vue';

export interface FaucetInfo {
  remainTime: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  faucet: {
    amount: number;
    unit: string;
  };
}

const initialInfoState = {
  remainTime: {
    hours: 0,
    minutes: 0,
    seconds: 0,
  },
  faucet: {
    amount: 0.002,
    unit: 'SBY',
  },
};

export function useFaucet() {
  const faucetInfo = ref<FaucetInfo>(initialInfoState);

  const getFaucetInfo = (): FaucetInfo => {
    // Todo: fetch from API
    const data = initialInfoState;

    return initialInfoState;
  };

  // const updateEra = async () => {
  //   const data = await getEra();
  //   if (!data) return;
  //   era.value = Number(data.era.toFixed(0));
  //   blockPerEra.value = data.blockPerEra;
  // };

  // const updateIntervalHandler = setInterval(() => {
  //   interval.value = interval.value + 1;
  // }, 30000);

  watchEffect(() => {
    faucetInfo.value = getFaucetInfo();
  });

  onUnmounted(() => {
    // clearInterval(updateIntervalHandler);
  });

  return {
    faucetInfo,
  };
}
