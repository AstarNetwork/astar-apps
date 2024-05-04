import { computed, watch } from 'vue';
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

  const activeInflationConfiguration = computed<InflationConfiguration>(
    () => store.getters['general/getActiveInflationConfiguration']
  );
  const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);

  const fetchActiveConfigurationToStore = async () => {
    const inflationRepository = container.get<IInflationRepository>(Symbols.InflationRepository);
    const activeConfiguration = await inflationRepository.getInflationConfiguration();
    store.commit('general/setActiveInflationConfiguration', activeConfiguration);
  };

  const calculateRealizedInflation = async (): Promise<bigint | undefined> => {
    let inflation: bigint | undefined;

    if ($api) {
      try {
        const subscanRepository = container.get<ISubscanRepository>(Symbols.SubscanRepository);
        const response = await subscanRepository.getEvents(
          networkNameSubstrate.value.toLocaleLowerCase(),
          'inflation',
          'NewInflationConfiguration'
        );
        const latestInflationConfigBlock = response.events[response.events.length - 1].block;

        const initialIssuanceBlockHash = await $api.rpc.chain.getBlockHash(
          latestInflationConfigBlock - 1
        );
        const apiAt = await $api.at(initialIssuanceBlockHash);
        const initialTotalIssuance = await apiAt.query.balances.totalIssuance();
        const realizedTotalIssuance = await $api.query.balances.totalIssuance();
        // const {
        //   periodsPerCycle,
        //   standardEraLength,
        //   standardErasPerBuildAndEarnPeriod,
        //   standardErasPerVotingPeriod,
        // } = eraLengths.value;
        // const cycleLengthInBlocks =
        //   standardEraLength *
        //   periodsPerCycle *
        //   (standardErasPerBuildAndEarnPeriod + standardErasPerVotingPeriod);
        const blockDifference = BigInt(currentBlock.value - latestInflationConfigBlock);
        // const cycleProgressions = blockDifference / cycleLengthInBlocks;
        const slope =
          BigInt(realizedTotalIssuance.sub(initialTotalIssuance).toString()) / blockDifference;
        inflation = blockDifference * slope + initialTotalIssuance.toBigInt();
        console.log(
          'Inflation:',
          Number(ethers.utils.formatEther(initialTotalIssuance.toString())) /
            Number(ethers.utils.formatEther(realizedTotalIssuance.toString()))
        );
      } catch (error) {
        console.error('Error calculating realized inflation', error);
      }
    }

    return inflation;
  };

  watch(
    [$api],
    async () => {
      const inflation = await calculateRealizedInflation();
      console.log('Realized inflation:', inflation);
    },
    { immediate: true }
  );

  return {
    activeInflationConfiguration,
    fetchActiveConfigurationToStore,
    calculateRealizedInflation,
  };
}
