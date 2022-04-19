import { Duration, filterTvlData, getTvlData } from 'src/modules/token-api';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';

export function useTvlHistorical() {
  const mergedArray = ref<number[][] | null>(null);
  const filteredData = ref<number[][] | null>(null);
  const currentTvl = ref<string>('');
  const currentFilter = ref<Duration>('7 days');
  const store = useStore();

  const network = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.chain : {};
  });

  const loadData = async (network: string): Promise<void> => {
    const { mergedData, tvl } = await getTvlData({ network });
    mergedArray.value = mergedData;
    currentTvl.value = tvl;
  };

  const handleFilterChanged = async (filter: Duration): Promise<void> => {
    if (currentFilter.value !== filter) {
      currentFilter.value = filter;
    }
  };

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

  watch(
    [currentFilter, mergedArray],
    () => {
      try {
        if (!mergedArray.value) return;
        const data = filterTvlData({
          mergedArray: mergedArray.value,
          duration: currentFilter.value,
        });
        filteredData.value = data;
      } catch (error) {
        console.error(error);
      }
    },
    { immediate: false }
  );

  return {
    filteredData,
    currentTvl,
    handleFilterChanged,
  };
}
