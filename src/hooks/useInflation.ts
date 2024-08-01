import { computed, watch, ref, Ref, ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import {
  BurnEvent,
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

  const getBurnEvents = async (): Promise<BurnEvent[]> => {
    // Ignore burn events with less than 1M ASTAR. They are not impacting charts a lot small burn amounts
    // could be a spam.
    const minBurn = BigInt('1000000000000000000000000');
    const tokenApiRepository = container.get<ITokenApiRepository>(Symbols.TokenApiRepository);
    const burnEvents = await tokenApiRepository.getBurnEvents(
      networkNameSubstrate.value.toLowerCase()
    );

    return burnEvents.filter((item) => item.amount >= minBurn);
  };

  /**
   * Estimates the realized inflation rate percentage based on the actual total issuance at the beginning
   * and estimated total issuance at the end of the current cycle.
   * According to the https://github.com/AstarNetwork/astar-apps/issues/1259
   */
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

      const burnEvents = await getBurnEvents();
      // Add first and last block so charts can be easily drawn.
      burnEvents.splice(0, 0, {
        blockNumber: period1StartBlock,
        amount: BigInt(0),
        user: '',
        timestamp: 0,
      });
      burnEvents.push({
        blockNumber: currentBlock.value,
        amount: BigInt(0),
        user: '',
        timestamp: 0,
      });

      const totalBurn = burnEvents.reduce((acc, item) => acc + item.amount, BigInt(0));
      // Used to calculate inflation rate.
      const initialTotalIssuanceWithoutBurn = initialTotalIssuance - totalBurn;

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
        BigInt((realizedTotalIssuance - initialTotalIssuanceWithoutBurn).toString()) /
        blockDifference;

      // Estimate total issuance at the end of the current cycle.
      const endOfCycleBlock = period1StartBlock + cycleLengthInBlocks;
      const endOfCycleTotalIssuance = Number(
        ethers.utils.formatEther(
          slope * BigInt(endOfCycleBlock - period1StartBlock) + initialTotalIssuanceWithoutBurn
        )
      );

      // Estimated inflation at the end of the current cycle.
      inflation =
        (100 *
          (endOfCycleTotalIssuance -
            Number(ethers.utils.formatEther(initialTotalIssuanceWithoutBurn.toString())))) /
        endOfCycleTotalIssuance;

      // Calculate maximum and realized inflation for each era in the cycle.
      calculateMaximumInflationData(
        period1StartBlock,
        endOfCycleBlock,
        initialTotalIssuance,
        cycleLengthInBlocks,
        inflationParameters.value?.maxInflationRate ?? 0,
        eraLengths.value.standardEraLength,
        burnEvents
      );

      calculateRealizedInflationData(
        period1StartBlock,
        currentBlock.value,
        slope,
        eraLengths.value.standardEraLength,
        initialTotalIssuance,
        burnEvents
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

    estimatedInflation.value = inflation;
  };

  const calculateMaximumInflationData = (
    firstBlock: number,
    lastBlock: number,
    firstBlockIssuance: bigint,
    cycleLengthInBlocks: number,
    maxInflation: number,
    eraLength: number,
    burnEvents: BurnEvent[]
  ): void => {
    const result: [number, number][] = [];
    const inflation = BigInt(Math.floor(maxInflation * 100)) * BigInt('10000000000000000');
    const cycleProgression = (firstBlockIssuance * inflation) / BigInt('1000000000000000000');
    const cycleLength = BigInt(cycleLengthInBlocks);

    // One sample per era.
    for (let j = 0; j < burnEvents.length - 1; j++) {
      for (
        let i = burnEvents[j].blockNumber;
        i <= burnEvents[j + 1].blockNumber + eraLength;
        i += eraLength
      ) {
        const inflation =
          (cycleProgression * BigInt(i - firstBlock)) / cycleLength +
          firstBlockIssuance -
          burnEvents[j].amount;

        result.push([i, Number(ethers.utils.formatEther(inflation.toString()))]);
      }
    }

    maximumInflationData.value = result;
  };

  const calculateRealizedInflationData = (
    firstBlock: number,
    lastBlock: number,
    slope: bigint,
    eraLength: number,
    firstBlockIssuance: bigint,
    burnEvents: BurnEvent[]
  ): void => {
    const result: [number, number][] = [];

    for (let j = 0; j < burnEvents.length - 1; j++) {
      for (
        let i = burnEvents[j].blockNumber;
        i <= burnEvents[j + 1].blockNumber + eraLength;
        i += eraLength
      ) {
        const currentBlockIssuance = Number(
          ethers.utils.formatEther(
            slope * BigInt(i - firstBlock) + firstBlockIssuance - burnEvents[j].amount
          )
        );

        result.push([i, currentBlockIssuance]);
      }
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
