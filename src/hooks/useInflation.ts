import { computed, ref, Ref, ComputedRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import {
  IBalancesRepository,
  IInflationRepository,
  ITokenApiRepository,
} from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { InflationConfiguration } from 'src/v2/models';
import { InflationParam, useDappStaking } from 'src/staking-v3';
import { ethers } from 'ethers';
import { useNetworkInfo } from './useNetworkInfo';
import { PERIOD1_START_BLOCKS } from 'src/constants';

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
  estimateRealizedInflation: () => Promise<void>;
};

const estimatedInflation = ref<number | undefined>(undefined);
const maximumInflationData = ref<[number, number][]>([]);
const realizedInflationData = ref<[number, number][]>([]);
const realizedAdjustableStakersPart = ref<number>(0);

export function useInflation(): UseInflation {
  const store = useStore();
  const { t } = useI18n();
  const { eraLengths, currentEraInfo } = useDappStaking();
  const { networkNameSubstrate } = useNetworkInfo();
  // const estimatedInflation = ref<number | undefined>(undefined);
  // const maximumInflationData = ref<[number, number][]>([]);
  // const realizedInflationData = ref<[number, number][]>([]);
  // const realizedAdjustableStakersPart = ref<number>(0);

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

  const estimateRealizedInflation = async (): Promise<void> => {
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
      const initialTotalIssuance = await balancesRepository.getTotalIssuance(period1StartBlock - 1); // -
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

      // Estimate total issuance at the end of the current cycle.
      const endOfCycleBlock = Math.max(period1StartBlock + cycleLengthInBlocks, currentBlock.value);

      // Calculate realized inflation.
      inflation =
        100 * (Number(realizedTotalIssuance - initialTotalIssuance) / Number(initialTotalIssuance));

      // Calculate maximum and realized inflation for each era in the cycle.
      calculateMaximumInflationData(
        period1StartBlock,
        endOfCycleBlock,
        initialTotalIssuance,
        cycleLengthInBlocks,
        inflationParameters.value?.maxInflationRate ?? 0,
        eraLengths.value.standardEraLength,
        eraLengths.value.standardErasPerVotingPeriod,
        eraLengths.value.standardErasPerBuildAndEarnPeriod
      );

      calculateAdjustableStakerRewards(
        realizedTotalIssuance,
        currentEraInfo.value?.currentStakeAmount.totalStake ?? BigInt(0),
        inflationParameters.value.adjustableStakersPart,
        inflationParameters.value.idealStakingRate
      );

      fetchRealizedInflationData(currentBlock.value, realizedTotalIssuance);
    } catch (error) {
      console.error('Error calculating realized inflation', error);
    }

    estimatedInflation.value = inflation;
  };

  const calculateMaximumInflationData = (
    firstBlock: number,
    lastBlock: number,
    firstBlockIssuance: bigint,
    cycleLengthInBlocks: number,
    maxInflation: number,
    standardEraLength: number,
    standardErasPerVotingPeriod: number,
    standardErasPerBuildAndEarnPeriod: number
  ): void => {
    const result: [number, number][] = [];
    const inflation = BigInt(Math.floor(maxInflation * 100)) * BigInt('10000000000000000');
    const cycleProgression = (firstBlockIssuance * inflation) / BigInt('1000000000000000000');
    const cycleLength = BigInt(cycleLengthInBlocks);

    // One sample per era (take into consideration that voting era takes multiple standard era lengths).
    let era = 0;
    const getEraLength = (era: number, block: number): number =>
      era === 1 || era % (standardErasPerBuildAndEarnPeriod + 2) === 0
        ? standardEraLength * standardErasPerVotingPeriod
        : standardEraLength;

    for (let i = firstBlock - 1; i <= lastBlock; i += getEraLength(era, i)) {
      const inflation =
        (cycleProgression * BigInt(i - firstBlock)) / cycleLength + firstBlockIssuance;

      result.push([i, Number(ethers.utils.formatEther(inflation.toString()))]);
      era++;
    }

    maximumInflationData.value = result;
  };

  const fetchRealizedInflationData = async (
    currentBlock: number,
    totalIssuance: bigint
  ): Promise<void> => {
    const tokenApiRepository = container.get<ITokenApiRepository>(Symbols.TokenApiRepository);
    const issuanceHistory = await tokenApiRepository.getTokeIssuanceHistory(
      networkNameSubstrate.value.toLowerCase()
    );

    // Current issuance is not included in the history yet.
    issuanceHistory.push({
      block: currentBlock,
      timestamp: Date.now(),
      balance: totalIssuance,
    });

    realizedInflationData.value = issuanceHistory.map((item) => [
      item.block,
      Number(ethers.utils.formatEther(item.balance.toString())),
    ]);
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

  watch(eraLengths, async () => {
    if (
      (eraLengths.value && maximumInflationData.value.length === 0) ||
      realizedInflationData.value.length === 0
    ) {
      estimateRealizedInflation();
    }
  });

  return {
    activeInflationConfiguration: activeInflationConfiguration,
    estimatedInflation,
    inflationParameters,
    maximumInflationData,
    realizedInflationData,
    realizedAdjustableStakersPart,
    fetchActiveConfigurationToStore,
    fetchInflationParamsToStore,
    getInflationParameters,
    estimateRealizedInflation,
  };
}
