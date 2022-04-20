import { Duration, filterTvlData, getTvlData } from 'src/modules/token-api';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';

export function useTvlHistorical() {
  const mergedTvlAmount = ref<string>('');
  const dappStakingTvlAmount = ref<string>('');
  const ecosystemTvlAmount = ref<string>('');

  const mergedTvl = ref<number[][] | null>(null);
  const dappStakingTvl = ref<number[][] | null>(null);
  const ecosystemTvl = ref<number[][] | null>(null);

  const mergedFilter = ref<Duration>('7 days');
  const dappStakingFilter = ref<Duration>('7 days');
  const ecosystemFilter = ref<Duration>('7 days');

  const store = useStore();
  const network = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.chain : {};
  });

  const loadData = async (network: string): Promise<void> => {
    const {
      mergedTvlData,
      ecosystemTvlData,
      dappStakingTvlData,
      mergedTvlValue,
      dappStakingTvlValue,
      ecosystemTvlValue,
    } = await getTvlData({
      network,
    });

    mergedTvl.value = mergedTvlData;
    ecosystemTvl.value = ecosystemTvlData;
    dappStakingTvl.value = dappStakingTvlData;
    mergedTvlAmount.value = mergedTvlValue;
    dappStakingTvlAmount.value = dappStakingTvlValue;
    ecosystemTvlAmount.value = ecosystemTvlValue;
  };

  const handleMergedTvlFilterChanged = (filter: Duration) => {
    mergedFilter.value = filter;
  };

  const handleDappStakingTvlFilterChanged = (filter: Duration) => {
    dappStakingFilter.value = filter;
  };

  const handleEcosystemTvlFilterChanged = (filter: Duration) => {
    ecosystemFilter.value = filter;
  };

  const filteredMergedTvl = computed(() => {
    try {
      if (!mergedTvl.value) return null;
      const data = filterTvlData({
        mergedArray: mergedTvl.value,
        duration: mergedFilter.value,
      });
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const filteredDappStakingTvl = computed(() => {
    const fallback = { merged: null, dappStaking: null };
    try {
      if (!dappStakingTvl.value || !mergedTvl.value) return fallback;
      const dappStaking = filterTvlData({
        mergedArray: dappStakingTvl.value,
        duration: dappStakingFilter.value,
      });

      const merged = filterTvlData({
        mergedArray: mergedTvl.value,
        duration: dappStakingFilter.value,
      });
      return { dappStaking, merged };
    } catch (error) {
      console.error(error);
      return fallback;
    }
  });

  const filteredEcosystemTvl = computed(() => {
    const fallback = { merged: null, ecosystem: null };
    try {
      if (!ecosystemTvl.value || !mergedTvl.value) return fallback;
      const ecosystem = filterTvlData({
        mergedArray: ecosystemTvl.value,
        duration: ecosystemFilter.value,
      });

      const merged = filterTvlData({
        mergedArray: mergedTvl.value,
        duration: ecosystemFilter.value,
      });
      return { ecosystem, merged };
    } catch (error) {
      console.error(error);
      return fallback;
    }
  });

  watch(
    [network],
    async () => {
      try {
        if (!network.value) return;
        await loadData(network.value);
      } catch (error) {
        console.error(error);
      }
    },
    { immediate: true }
  );

  return {
    mergedTvlAmount,
    filteredMergedTvl,
    filteredDappStakingTvl,
    filteredEcosystemTvl,
    dappStakingTvlAmount,
    ecosystemTvlAmount,
    ecosystemTvl,
    dappStakingTvl,
    handleMergedTvlFilterChanged,
    handleDappStakingTvlFilterChanged,
    handleEcosystemTvlFilterChanged,
  };
}
