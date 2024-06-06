import { Ref, watch, ref, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { container } from 'src/v2/common';
import { IBalancesRepository, ITokenApiRepository, PeriodData } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { useDapps } from './useDapps';
import { DappState, IDappStakingRepository } from '../logic';
import { PERIOD1_START_BLOCKS } from 'src/consts';
import { useDappStaking } from './useDappStaking';

export type DappStatistics = {
  name: string;
  iconUrl: string;
  stakeAmount: bigint;
  rewardAmount: bigint;
};

export function usePeriodStats(period: Ref<number>) {
  const { currentNetworkName } = useNetworkInfo();
  const { eraLengths, protocolState, currentBlock } = useDappStaking();
  const { getDapp } = useDapps();

  const periodData = ref<PeriodData[]>([]);
  const tvlRatio = ref<number>();

  const dappStatistics = computed<DappStatistics[]>(() => {
    const combinedData = periodData.value.map((data) => {
      const dApp = getDapp(data.dappAddress);
      if (dApp && dApp.chain.state === DappState.Registered) {
        return {
          name: dApp.basic.name,
          iconUrl: dApp.basic.iconUrl,
          stakeAmount: data.stakeAmount,
          rewardAmount: data.rewardAmount,
        };
      }
    });

    return combinedData.filter((data) => data !== undefined) as DappStatistics[];
  });

  const getPeriodEndBlock = (period: number, currentPeriod: number): number => {
    const periodStartBlock = PERIOD1_START_BLOCKS.get(currentNetworkName.value.toLowerCase());

    if (periodStartBlock) {
      if (period < currentPeriod) {
        const {
          standardEraLength,
          standardErasPerBuildAndEarnPeriod,
          standardErasPerVotingPeriod,
        } = eraLengths.value;
        return (
          periodStartBlock +
          (standardErasPerBuildAndEarnPeriod + standardErasPerVotingPeriod) *
            standardEraLength *
            period -
          1
        );
      }

      return currentBlock.value;
    }

    throw new Error(
      `Can't determine dApp staking start block for network ${currentNetworkName.value}`
    );
  };

  watch(
    [period, currentNetworkName, protocolState, eraLengths],
    async () => {
      if (
        currentNetworkName.value &&
        currentBlock.value &&
        protocolState.value &&
        eraLengths.value.standardEraLength
      ) {
        const repository = container.get<ITokenApiRepository>(Symbols.TokenApiRepository);
        const balancesRepository = container.get<IBalancesRepository>(Symbols.BalancesRepository);
        const dappStakingRepository = container.get<IDappStakingRepository>(
          Symbols.DappStakingRepositoryV3
        );
        try {
          const periodEndBlock = getPeriodEndBlock(
            period.value,
            protocolState.value?.periodInfo.number ?? period.value
          );
          const [stats, totalIssuance, periodInfo] = await Promise.all([
            repository.getStakingPeriodStatistics(
              currentNetworkName.value.toLowerCase(),
              period.value
            ),
            balancesRepository.getTotalIssuance(periodEndBlock),
            dappStakingRepository.getCurrentEraInfo(periodEndBlock),
          ]);
          periodData.value = stats;
          tvlRatio.value = 1 / Number(totalIssuance / periodInfo.totalLocked);
          console.log('tvlRatio', tvlRatio.value);
        } catch (error) {
          console.error('Failed to get staking period statistics', error);
        }
      }
    },
    { immediate: true }
  );

  return { dappStatistics, tvlRatio };
}
