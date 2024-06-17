import { computed, watch, ref, Ref, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IBalancesRepository, IInflationRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { InflationConfiguration } from 'src/v2/models';
import { InflationParam, useDappStaking } from 'src/staking-v3';
import { ethers } from 'ethers';
import { useNetworkInfo } from './useNetworkInfo';
import { PERIOD1_START_BLOCKS } from 'src/consts';

type UseInflation = {
  activeInflationConfiguration: ComputedRef<InflationConfiguration>;
  estimatedInflation: Ref<number | undefined>;
  inflationParameters: Ref<InflationParam>;
  maximumInflationData: Ref<[number, number][]>;
  realizedInflationData: Ref<[number, number][]>;
  realizedAdjustableStakersPart: Ref<number>;
  fetchActiveConfigurationToStore: () => Promise<void>;
  fetchInflationParamsToStore: () => Promise<void>;
  getInflationParameters: () => Promise<InflationParam>;
};

export function useInflation(): UseInflation {
  const store = useStore();
  const { t } = useI18n();
  const { eraLengths, currentEraInfo } = useDappStaking();
  const { networkNameSubstrate } = useNetworkInfo();
  const estimatedInflation = ref<number | undefined>(undefined);
  const maximumInflationData = ref<[number, number][]>([]);
  const realizedInflationData = ref<[number, number][]>([]);
  const realizedAdjustableStakersPart = ref<number>(0);

  const activeInflationConfiguration = computed<InflationConfiguration>(
    () => store.getters['general/getActiveInflationConfiguration']
  );
  const inflationParameters = computed<InflationParam>(
    () => store.getters['general/getInflationParameters']
  );
  const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);

  const fetchActiveConfigurationToStore = async (): Promise<void> => {
    const inflationRepository = container.get<IInflationRepository>(Symbols.InflationRepository);
    const activeConfiguration = await inflationRepository.getInflationConfiguration();
    store.commit('general/setActiveInflationConfiguration', activeConfiguration);
  };

  const fetchInflationParamsToStore = async (): Promise<void> => {
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

    try {
      const period1StartBlock = PERIOD1_START_BLOCKS.get(networkNameSubstrate.value.toLowerCase());

      if (!period1StartBlock) {
        console.warn(
          t('dashboard.inflation.wrongNetwork', { network: networkNameSubstrate.value })
        );
        return;
      }

      const balancesRepository = container.get<IBalancesRepository>(Symbols.BalancesRepository);
      const initialTotalIssuance = await balancesRepository.getTotalIssuance(period1StartBlock - 1);
      const realizedTotalIssuance = await balancesRepository.getTotalIssuance();

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
      const blockDifference = BigInt(currentBlock.value - period1StartBlock);
      const slope =
        BigInt((realizedTotalIssuance - initialTotalIssuance).toString()) / blockDifference;

      // Estimate total issuance at the end of the current cycle.
      const endOfCycleBlock = period1StartBlock + cycleLengthInBlocks;
      const endOfCycleTotalIssuance = Number(
        ethers.utils.formatEther(
          slope * BigInt(endOfCycleBlock - period1StartBlock) + initialTotalIssuance
        )
      );

      // Estimated inflation at the end of the current cycle.
      inflation =
        (100 *
          (endOfCycleTotalIssuance -
            Number(ethers.utils.formatEther(initialTotalIssuance.toString())))) /
        endOfCycleTotalIssuance;

      // Calculate maximum and realized inflation for each era in the cycle.
      calculateMaximumInflationData(
        period1StartBlock,
        endOfCycleBlock,
        initialTotalIssuance,
        cycleLengthInBlocks,
        inflationParameters.value.maxInflationRate,
        eraLengths.value.standardEraLength
      );

      calculateRealizedInflationData(
        period1StartBlock,
        currentBlock.value,
        slope,
        eraLengths.value.standardEraLength,
        initialTotalIssuance
      );

      calculateAdjustableStakerRewards(
        realizedTotalIssuance,
        currentEraInfo.value?.currentStakeAmount.totalStake ?? BigInt(0),
        inflationParameters.value.adjustableStakersPart,
        inflationParameters.value.idealStakingRate
      );
    } catch (error) {
      console.error('Error calculating realized inflation', error);
    }

    return inflation;
  };

  const calculateMaximumInflationData = (
    firstBlock: number,
    lastBlock: number,
    firstBlockIssuance: bigint,
    cycleLengthInBlocks: number,
    maxInflation: number,
    eraLength: number
  ): void => {
    const result: [number, number][] = [];
    const inflation = BigInt(Math.floor(maxInflation * 100)) * BigInt('10000000000000000');
    const cycleProgression = (firstBlockIssuance * inflation) / BigInt('1000000000000000000');
    const cycleLength = BigInt(cycleLengthInBlocks);

    // One sample per era.
    for (let i = firstBlock; i <= lastBlock; i += eraLength) {
      const inflation =
        (cycleProgression * BigInt(i - firstBlock)) / cycleLength + firstBlockIssuance;

      result.push([i, Number(ethers.utils.formatEther(inflation.toString()))]);
    }

    // console.log((result[result.length - 1][1] - result[0][1]) / result[result.length - 1][1]);
    maximumInflationData.value = result;
  };

  const calculateRealizedInflationData = (
    firstBlock: number,
    lastBlock: number,
    slope: bigint,
    eraLength: number,
    firstBlockIssuance: bigint
  ): void => {
    const result: [number, number][] = [];

    for (let i = firstBlock; i <= lastBlock; i += eraLength) {
      const currentBlockIssuance = Number(
        ethers.utils.formatEther(slope * BigInt(i - firstBlock) + firstBlockIssuance)
      );

      result.push([i, currentBlockIssuance]);
    }

    realizedInflationData.value = result;
  };

  const calculateAdjustableStakerRewards = (
    totalIssuance: bigint,
    totalStake: bigint,
    adjustableStakerPart: number,
    idealStakingRate: number
  ): void => {
    const stakeRate =
      totalStake <= BigInt(0)
        ? 0
        : Number(ethers.utils.formatEther(totalStake.toString())) /
          Number(ethers.utils.formatEther(totalIssuance.toString()));
    const result = adjustableStakerPart * Math.min(1, stakeRate / idealStakingRate);
    realizedAdjustableStakersPart.value = Number(result.toFixed(3));
  };

  watch(
    [activeInflationConfiguration, inflationParameters],
    async () => {
      if (activeInflationConfiguration.value && inflationParameters.value) {
        estimatedInflation.value = await estimateRealizedInflation();
      }
    },
    { immediate: true }
  );

  return {
    activeInflationConfiguration,
    estimatedInflation,
    inflationParameters,
    maximumInflationData,
    realizedInflationData,
    realizedAdjustableStakersPart,
    fetchActiveConfigurationToStore,
    fetchInflationParamsToStore,
    getInflationParameters,
  };
}
