import { ref, watch, onUnmounted } from 'vue';
import { useApi } from '.';

const ASTAR_BLOCK_TIME = 12000;

export function useCurrentEra() {
  const era = ref<string>('0');
  const blockPerEra = ref<string>('0');
  const blockUntilNextEra = ref<number>(0);
  const progress = ref<number>(0);
  const interval = ref<number>(0);
  const { api } = useApi();

  const getEra = async (): Promise<{ era: string; blockPerEra: string } | void> => {
    const apiRef = api && api.value;
    if (!apiRef) return;

    const result = await Promise.all([
      apiRef.query.dappsStaking.currentEra(),
      apiRef.consts.dappsStaking.blockPerEra,
      apiRef.derive.chain.bestNumber,
    ]);

    const era = result[0].toString();
    const blockPerEra = result[1].toString();

    const handleBestNumber = result[2];
    await handleBestNumber((bestNumber) => {
      const best = bestNumber.toNumber();
      const progressRes = ((best % Number(blockPerEra)) / Number(blockPerEra)) * 100;
      const countDown = Number(blockPerEra) - (best % Number(blockPerEra));
      progress.value = progressRes * 0.01;
      blockUntilNextEra.value = countDown;
    });

    return { era, blockPerEra };
  };

  const updateEra = async () => {
    const data = await getEra();
    if (!data) return;
    era.value = data.era;
    blockPerEra.value = data.blockPerEra;
  };

  const updateIntervalHandler = setInterval(() => {
    interval.value = interval.value + 1;
  }, ASTAR_BLOCK_TIME);

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
    blockUntilNextEra,
  };
}
