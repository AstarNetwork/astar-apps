import { $api } from 'boot/api';
import { onUnmounted, ref, watchEffect, computed } from 'vue';
import { useCurrentEra } from '../useCurrentEra';
import { DateTime } from 'luxon';
export const useAvgBlockTime = () => {
  const { blockPerEra, era, progress, nextEraStartingBlock } = useCurrentEra();

  const avgBlockTime = ref<number>(0);
  const latestBlock = ref<number>(0);
  const blocksUntilNextEra = ref<number>(0);
  const etaNextEra = ref<string>('');

  const updateAvgBlock = async () => {
    const apiRef = $api.value;
    const blockPerEraRef = blockPerEra.value;
    if (!apiRef || !blockPerEraRef) {
      return;
    }

    try {
      const [tsNow, header] = await Promise.all([
        apiRef.query.timestamp.now(),
        apiRef.rpc.chain.getHeader(),
      ]);

      latestBlock.value = header.toJSON().number as number;
      const blockSevenEra = blockPerEraRef * 7;
      const blockWeekAgo = latestBlock.value - blockSevenEra;
      const hashBlockWeekAgo = await apiRef.rpc.chain.getBlockHash(blockWeekAgo);
      const tsBlockWeekAgo = await (await apiRef.at(hashBlockWeekAgo)).query.timestamp.now();

      const spentSecs = (tsNow.toNumber() - tsBlockWeekAgo.toNumber()) / 1000;
      avgBlockTime.value = spentSecs / (latestBlock.value - blockWeekAgo);
      blocksUntilNextEra.value = nextEraStartingBlock.value - latestBlock.value;

      const countdownNextEraSecs = blocksUntilNextEra.value * avgBlockTime.value;
      etaNextEra.value = DateTime.local()
        .plus(countdownNextEraSecs * 1000)
        .toFormat('HH:mm dd-MMM');
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = computed(() => {
    if (
      avgBlockTime.value &&
      latestBlock.value &&
      era.value &&
      blocksUntilNextEra.value &&
      progress.value &&
      etaNextEra.value
    ) {
      return false;
    } else {
      return true;
    }
  });

  const updateIntervalHandler = setInterval(() => {
    updateAvgBlock();
  }, 4000);

  watchEffect(async () => {
    updateAvgBlock();
  });

  onUnmounted(() => {
    clearInterval(updateIntervalHandler);
  });

  return { avgBlockTime, latestBlock, era, blocksUntilNextEra, progress, etaNextEra, isLoading };
};
