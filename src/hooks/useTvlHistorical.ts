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
    try {
      if (!dappStakingTvl.value) return null;
      const data = filterTvlData({
        mergedArray: dappStakingTvl.value,
        duration: dappStakingFilter.value,
      });
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  });

  const filteredEcosystemTvl = computed(() => {
    try {
      if (!ecosystemTvl.value) return null;
      const data = filterTvlData({
        mergedArray: ecosystemTvl.value,
        duration: ecosystemFilter.value,
      });
      return data;
    } catch (error) {
      console.error(error);
      return null;
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
