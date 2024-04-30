import { computed, watch } from 'vue';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { IInflationRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { InflationConfiguration } from 'src/v2/models';
import { $api } from 'src/boot/api';
import { useDappStaking } from 'src/staking-v3';

export function useInflation() {
  const store = useStore();
  const { eraLengths } = useDappStaking();

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
        // TODO Fetch latest newinflationconfiguration event and determine block
        const latestInflationConfigBlock = 5514935;

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
