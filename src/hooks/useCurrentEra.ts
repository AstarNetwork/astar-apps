import { ref, watch, onUnmounted } from 'vue';
import { useApi } from '.';

export function useCurrentEra() {
  const era = ref<number>(0);
  const blockPerEra = ref<number>(0);
  const blocksUntilNextEra = ref<number>(0);
  const progress = ref<number>(0);
  const interval = ref<number>(0);
  const { api } = useApi();

  const getEra = async (): Promise<{ era: number; blockPerEra: number } | void> => {
    const apiRef = api && api.value;
    if (!apiRef) return;

    const result = await Promise.all([
      apiRef.query.dappsStaking.currentEra(),
      apiRef.consts.dappsStaking.blockPerEra,
      apiRef.derive.chain.bestNumber,
    ]);

    const era = Number(result[0].toString());
    const blockPerEra = Number(result[1].toString());

    const handleBestNumber = result[2];
    await handleBestNumber((bestNumber) => {
      const best = bestNumber.toNumber();
      const progressRes = ((best % blockPerEra) / blockPerEra) * 100;
      const countDown = blockPerEra - (best % blockPerEra);
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
    [api, interval],
    () => {
      const apiRef = api && api.value;
      if (!apiRef) return;
      apiRef.isReady.then(() => {
        updateEra();
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
  };
}
