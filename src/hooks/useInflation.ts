import { computed, watch, ref } from 'vue';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IInflationRepository, ISubscanRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { InflationConfiguration } from 'src/v2/models';
import { $api } from 'src/boot/api';
import { InflationParam, useDappStaking } from 'src/staking-v3';
import { ethers } from 'ethers';
import { useNetworkInfo } from './useNetworkInfo';

export function useInflation() {
  const store = useStore();
  const { eraLengths } = useDappStaking();
  const { networkNameSubstrate } = useNetworkInfo();
  const estimatedInflation = ref<number | undefined>(undefined);
  const maximumInflationData = ref<[number, number][]>([]);
  const realizedInflationData = ref<[number, number][]>([]);

  const activeInflationConfiguration = computed<InflationConfiguration>(
    () => store.getters['general/getActiveInflationConfiguration']
  );
  const inflationParameters = computed<InflationParam>(
    () => store.getters['general/getInflationParameters']
  );
  const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);

  const fetchActiveConfigurationToStore = async () => {
    const inflationRepository = container.get<IInflationRepository>(Symbols.InflationRepository);
    const activeConfiguration = await inflationRepository.getInflationConfiguration();
    store.commit('general/setActiveInflationConfiguration', activeConfiguration);
  };

  const fetchInflationParamsToStore = async () => {
    const inflationRepository = container.get<IInflationRepository>(Symbols.InflationRepository);
    const params = await inflationRepository.getInflationParams();
    store.commit('general/setInflationParameters', params);
  };

  const getInflationParameters = async (): Promise<InflationParam> => {
    const inflationRepository = container.get<IInflationRepository>(Symbols.InflationRepository);
    return await inflationRepository.getInflationParams();
  };

  /**
   * Estimates the realized inflation rate percentage based on the actual total issuance at the beginning
   * and estimated total issuance at the end of the current cycle.
   * According to the https://github.com/AstarNetwork/astar-apps/issues/1259
   */
  const estimateRealizedInflation = async (): Promise<number | undefined> => {
    let inflation: number | undefined;

    if ($api) {
      try {
        // Find the block when last NewInflationConfiguration event was emitted.
        const subscanRepository = container.get<ISubscanRepository>(Symbols.SubscanRepository);
        const response = await subscanRepository.getEvents(
          networkNameSubstrate.value.toLowerCase(),
          'inflation',
          'NewInflationConfiguration'
        );
        // Latest item in array is for the current inflation cycle.
        const initialCycleBlock = response.events[response.events.length - 1].block;

        const initialIssuanceBlockHash = await $api.rpc.chain.getBlockHash(initialCycleBlock - 1);
        const apiAt = await $api.at(initialIssuanceBlockHash);
        const initialTotalIssuance = await apiAt.query.balances.totalIssuance();
        const realizedTotalIssuance = await $api.query.balances.totalIssuance();
        const {
          periodsPerCycle,
          standardEraLength,
          standardErasPerBuildAndEarnPeriod,
          standardErasPerVotingPeriod,
        } = eraLengths.value;
        const cycleLengthInBlocks =
          standardEraLength *
          periodsPerCycle *
          (standardErasPerBuildAndEarnPeriod + standardErasPerVotingPeriod);
        const blockDifference = BigInt(currentBlock.value - initialCycleBlock);
        const slope =
          BigInt(realizedTotalIssuance.sub(initialTotalIssuance).toString()) / blockDifference;

        // Estimate total issuance at the end of the current cycle.
        const endOfCycleBlock = initialCycleBlock + cycleLengthInBlocks;
        const endOfCycleTotalIssuance = Number(
          ethers.utils.formatEther(
            slope * BigInt(endOfCycleBlock - initialCycleBlock) + initialTotalIssuance.toBigInt()
          )
        );

        // Estimated inflation at the end of the current cycle.
        inflation =
          (100 *
            (endOfCycleTotalIssuance -
              Number(ethers.utils.formatEther(initialTotalIssuance.toString())))) /
          endOfCycleTotalIssuance;

        calculateMaximumInflationData(
          initialCycleBlock,
          endOfCycleBlock,
          initialTotalIssuance.toBigInt()
        );
      } catch (error) {
        console.error('Error calculating realized inflation', error);
      }
    }

    return inflation;
  };

  const calculateMaximumInflationData = (
    firstBlock: number,
    lastBlock: number,
    firstBlockIssuance: bigint
  ): void => {
    // One sample per era.
    const result: [number, number][] = [];
    for (let i = firstBlock; i <= lastBlock; i += eraLengths.value.standardEraLength) {
      // maximumInflationData.value.push([i, activeInflationConfiguration.value.issuanceSafetyCap]);
    }

    maximumInflationData.value = result;
  };

  watch(
    [activeInflationConfiguration],
    async () => {
      estimatedInflation.value = await estimateRealizedInflation();
    },
    { immediate: true }
  );

  return {
    activeInflationConfiguration,
    estimatedInflation,
    inflationParameters,
    fetchActiveConfigurationToStore,
    fetchInflationParamsToStore,
    getInflationParameters,
  };
}
