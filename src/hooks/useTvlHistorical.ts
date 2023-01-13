import { ApiPromise } from '@polkadot/api';
import { $api } from 'src/boot/api';
import { computed, ref, watch } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import {
  getDappStakers,
  getTvlData,
  filterTvlData,
  mergeTvlArray,
  Duration,
} from '@astar-network/astar-sdk-core';

export function useTvlHistorical() {
  const mergedTvlAmount = ref<string>('');
  const dappStakingTvlAmount = ref<string>('');
  const ecosystemTvlAmount = ref<string>('');

  const mergedTvl = ref<number[][] | null>(null);
  const dappStakingTvl = ref<number[][] | null>(null);
  const ecosystemTvl = ref<number[][] | null>(null);

  const mergedFilter = ref<Duration>('90 days');
  const dappStakingFilter = ref<Duration>('90 days');
  const ecosystemFilter = ref<Duration>('90 days');

  const lenStakers = ref<string>('0');

  const { currentNetworkName } = useNetworkInfo();

  const fetchDappStakers = async (api: ApiPromise) => {
    const result = await getDappStakers({ api });
    lenStakers.value = `${result.toLocaleString('en-US')} stakers`;
  };

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
        data: mergedTvl.value,
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
        data: dappStakingTvl.value,
        duration: dappStakingFilter.value,
      });

      const merged = filterTvlData({
        data: mergedTvl.value,
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
      if (!ecosystemTvl.value || !mergedTvl.value || !dappStakingTvl.value) {
        return fallback;
      }
      const ecosystem = filterTvlData({
        data: ecosystemTvl.value,
        duration: ecosystemFilter.value,
      });

      const mergedTvlData = dappStakingTvl.value.length
        ? mergeTvlArray({
            ecosystem: [...ecosystemTvl.value],
            dappStaking: [...dappStakingTvl.value],
            base: 'ecosystem',
          })
        : ecosystemTvl.value;

      const merged = filterTvlData({
        data: mergedTvlData,
        duration: ecosystemFilter.value,
      });
      return { ecosystem, merged };
    } catch (error) {
      console.error(error);
      return fallback;
    }
  });

  watch(
    [currentNetworkName],
    async () => {
      const api = $api;
      try {
        if (!currentNetworkName.value || !currentNetworkName.value.length || !api) return;
        await Promise.all([
          loadData(currentNetworkName.value.toLowerCase()),
          fetchDappStakers(api),
        ]);
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
    lenStakers,
    handleMergedTvlFilterChanged,
    handleDappStakingTvlFilterChanged,
    handleEcosystemTvlFilterChanged,
  };
}
