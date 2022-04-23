import { $api } from 'boot/api';
import { DateTime } from 'luxon';
import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useCurrentEra } from '../useCurrentEra';

export const useAvgBlockTime = (path: string) => {
  const { blockPerEra, era, progress, nextEraStartingBlock } = useCurrentEra();

  const avgBlockTime = ref<number>(0);
  const latestBlock = ref<number>(0);
  const internalLatestBlock = ref<number>(0);
  const blocksUntilNextEra = ref<number>(0);
  const etaNextEra = ref<string>('');
  const isLoading = ref<boolean>(true);

  const router = useRouter();
  const currentPath = computed(() => router.currentRoute.value.path.split('/')[1]);
  const isUnsubscribe = computed(() => currentPath.value !== path);

  const updateBlock = () => {
    $api.value?.derive.chain.subscribeNewHeads((header) => {
      try {
        const blockHeight = Number(header.number);
        internalLatestBlock.value = blockHeight;
        if (latestBlock.value > 0) {
          latestBlock.value = blockHeight;
        }
      } catch (error) {
        console.error(error);
      }
    });
  };

  const setLatestBlock = (): void => {
    if (avgBlockTime.value > 0 && latestBlock.value === 0) {
      const delay = 600;
      setTimeout(() => {
        latestBlock.value = internalLatestBlock.value;
      }, delay);
    }
  };

  const updateAvgBlock = async (blockHeight: number): Promise<void> => {
    const apiRef = $api.value;
    const blockPerEraRef = blockPerEra.value;
    if (!apiRef || !blockPerEraRef || blockHeight === 0) {
      return;
    }

    try {
      const blockSevenEra = blockPerEraRef * 7;
      const blockWeekAgo = blockHeight - blockSevenEra;
      const [tsNow, hashBlockWeekAgo] = await Promise.all([
        apiRef.query.timestamp.now(),
        apiRef.rpc.chain.getBlockHash(blockWeekAgo),
      ]);

      const tsBlockWeekAgo = await (await apiRef.at(hashBlockWeekAgo)).query.timestamp.now();

      const spentSecs = (tsNow.toNumber() - tsBlockWeekAgo.toNumber()) / 1000;
      avgBlockTime.value = spentSecs / (blockHeight - blockWeekAgo);
      blocksUntilNextEra.value = nextEraStartingBlock.value - blockHeight;

      const countdownNextEraSecs = blocksUntilNextEra.value * avgBlockTime.value;
      etaNextEra.value = DateTime.local()
        .plus(countdownNextEraSecs * 1000)
        .toFormat('HH:mm dd-MMM');
      if (isLoading.value) {
        isLoading.value = false;
      }
    } catch (error) {
      console.error(error);
    }
  };

  updateBlock();

  watchEffect(async () => {
    if (internalLatestBlock.value > 0 && !isUnsubscribe.value) {
      await updateAvgBlock(internalLatestBlock.value);
    }
  });

  watchEffect(() => {
    setLatestBlock();
  });

  return { avgBlockTime, latestBlock, era, blocksUntilNextEra, progress, etaNextEra, isLoading };
};
