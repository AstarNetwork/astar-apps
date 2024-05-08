import { computed, watch, ref } from 'vue';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IInflationRepository, ISubscanRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { InflationConfiguration } from 'src/v2/models';
import { $api } from 'src/boot/api';
import { useDappStaking } from 'src/staking-v3';
import { ethers } from 'ethers';
import { useNetworkInfo } from './useNetworkInfo';

export function useInflation() {
  const store = useStore();
  const { eraLengths } = useDappStaking();
  const { networkNameSubstrate } = useNetworkInfo();
  const estimatedInflation = ref<number | undefined>(undefined);

  const activeInflationConfiguration = computed<InflationConfiguration>(
    () => store.getters['general/getActiveInflationConfiguration']
  );
  const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);

  const fetchActiveConfigurationToStore = async () => {
    const inflationRepository = container.get<IInflationRepository>(Symbols.InflationRepository);
    const activeConfiguration = await inflationRepository.getInflationConfiguration();
    store.commit('general/setActiveInflationConfiguration', activeConfiguration);
  };

  /**
   * Estimates the realized inflation rate percentage based on the actual total issuance at the beginning
   * and estimated total issuance at the end of the current cycle.
   */
  const estimateRealizedInflation = async (): Promise<number | undefined> => {
    let inflation: number | undefined;

    if ($api) {
      try {
        const subscanRepository = container.get<ISubscanRepository>(Symbols.SubscanRepository);
        const response = await subscanRepository.getEvents(
          networkNameSubstrate.value.toLocaleLowerCase(),
          'inflation',
          'NewInflationConfiguration'
        );
        // Latest item in array is for the current inflation cycle.
        const latestInflationConfigBlock = response.events[response.events.length - 1].block;

        const initialIssuanceBlockHash = await $api.rpc.chain.getBlockHash(
          latestInflationConfigBlock - 1
        );
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
        const blockDifference = BigInt(currentBlock.value - latestInflationConfigBlock);
        const slope =
          BigInt(realizedTotalIssuance.sub(initialTotalIssuance).toString()) / blockDifference;

        // Estimate total issuance at the end of the current cycle.
        const endOfCycleBlock = latestInflationConfigBlock + cycleLengthInBlocks;
        const endOfCycleTotalIssuance = Number(
          ethers.utils.formatEther(
            slope * BigInt(endOfCycleBlock - latestInflationConfigBlock) +
              initialTotalIssuance.toBigInt()
          )
        );

        // Estimated inflation at the end of the cycle.
        inflation =
          (100 *
            (endOfCycleTotalIssuance -
              Number(ethers.utils.formatEther(initialTotalIssuance.toString())))) /
          endOfCycleTotalIssuance;
      } catch (error) {
        console.error('Error calculating realized inflation', error);
      }
    }

    return inflation;
  };

  watch(
    [$api],
    async () => {
      estimatedInflation.value = await estimateRealizedInflation();
      console.log('Realized inflation:', estimatedInflation.value);
    },
    { immediate: true }
  );

  return {
    activeInflationConfiguration,
    estimatedInflation,
    fetchActiveConfigurationToStore,
  };
}
