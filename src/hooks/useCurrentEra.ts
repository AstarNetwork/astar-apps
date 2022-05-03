import { ref, watch, onUnmounted } from 'vue';
import { $api } from 'boot/api';

export function useCurrentEra() {
  const era = ref<number>(0);
  const blockPerEra = ref<number>(0);
  const blocksUntilNextEra = ref<number>(0);
  const progress = ref<number>(0);
  const interval = ref<number>(0);
  const nextEraStartingBlock = ref<number>(0);

  const getEra = async (): Promise<{ era: number; blockPerEra: number } | void> => {
    const [currentEra, blockAmtPerEra, blockHeight, nextEraStartingBlockHeight] = await Promise.all(
      [
        $api.value!.query.dappsStaking.currentEra(),
        $api.value!.consts.dappsStaking.blockPerEra,
        $api.value!.derive.chain.bestNumber,
        $api.value!.query.dappsStaking.nextEraStartingBlock(),
      ]
    );

    const era = Number(currentEra.toString());
    const blockPerEra = Number(blockAmtPerEra.toString());

    const handleBestNumber = blockHeight;
    await handleBestNumber((bestNumber) => {
      const best = bestNumber.toNumber();
      nextEraStartingBlock.value = Number(nextEraStartingBlockHeight.toString());
      const countDown = nextEraStartingBlock.value - best;
      const progressRes = ((blockPerEra - countDown) / blockPerEra) * 100;
      progress.value = Number(progressRes.toFixed(0));
      blocksUntilNextEra.value = countDown;
    });

    return { era, blockPerEra };
  };

  const updateEra = async () => {
    const data = await getEra();
    if (!data) return;
    era.value = Number(data.era.toFixed(0));
    blockPerEra.value = data.blockPerEra;
  };

  const updateIntervalHandler = setInterval(() => {
    interval.value = interval.value + 1;
  }, 30000);

  watch(
    [$api, interval],
    () => {
      $api.value!.isReady.then(() => {
        try {
          updateEra();
        } catch (error) {
          console.error(error);
        }
      });
    },
    { immediate: true }
  );

  onUnmounted(() => {
    clearInterval(updateIntervalHandler);
  });

  return {
    era,
    blockPerEra,
    progress,
    blocksUntilNextEra,
    nextEraStartingBlock,
  };
}
