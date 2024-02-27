import { $api } from 'boot/api';
import { PeriodType, useDappStaking } from 'src/staking-v3';
import { onUnmounted, ref, watch } from 'vue';

export function useCurrentEra() {
  const era = ref<number>(0);
  const blockPerEra = ref<number>(0);
  const blocksUntilNextEra = ref<number>(0);
  const progress = ref<number>(0);
  const interval = ref<number>(0);
  const nextEraStartingBlock = ref<number>(0);

  const { eraLengths, protocolState, isDappStakingV3 } = useDappStaking();

  // Todo: Refactor here after the dApp staking V3 has been implemented on Astar
  const getEra = async (): Promise<{ era: number; blockPerEra: number } | void> => {
    const apiRef = $api!;

    let era;
    let blockAmtPerEra;
    let blockHeight;
    let nextEraStartingBlockHeight;

    if (isDappStakingV3.value) {
      if (!protocolState.value || !eraLengths.value) return;
      era = Number(protocolState.value.era);
      blockAmtPerEra =
        protocolState.value.periodInfo.subperiod === PeriodType.BuildAndEarn
          ? eraLengths.value.standardEraLength
          : eraLengths.value.standardEraLength * eraLengths.value.standardErasPerVotingPeriod;
      blockHeight = apiRef.derive.chain.bestNumber;
      nextEraStartingBlock.value = Number(protocolState.value?.nextEraStart);
    } else {
      let currentEra;
      [currentEra, blockAmtPerEra, blockHeight, nextEraStartingBlockHeight] = await Promise.all([
        apiRef.query.dappsStaking.currentEra(),
        apiRef.consts.dappsStaking.blockPerEra,
        apiRef.derive.chain.bestNumber,
        apiRef.query.dappsStaking.nextEraStartingBlock(),
      ]);
      era = Number(currentEra.toString());
      nextEraStartingBlock.value = Number(nextEraStartingBlockHeight.toString());
    }

    const blockPerEra = Number(blockAmtPerEra.toString());
    const handleBestNumber = blockHeight;
    await handleBestNumber((bestNumber) => {
      const best = bestNumber.toNumber();
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
    [interval, protocolState, eraLengths],
    () => {
      const apiRef = $api;
      if (!apiRef) return;
      apiRef.isReady.then(() => {
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
