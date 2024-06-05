import { Ref, watch, ref, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { container } from 'src/v2/common';
import { ITokenApiRepository, PeriodData } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { useDapps } from './useDapps';
import { DappState } from '../logic';

export type DappStatistics = {
  name: string;
  iconUrl: string;
  stakeAmount: bigint;
  rewardAmount: bigint;
};

export function usePeriodStats(period: Ref<number>) {
  const { currentNetworkName } = useNetworkInfo();
  const { getDapp } = useDapps();

  const periodData = ref<PeriodData[]>([]);

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

  watch(
    [period, currentNetworkName],
    async () => {
      if (currentNetworkName.value) {
        const repository = container.get<ITokenApiRepository>(Symbols.TokenApiRepository);
        try {
          const stats = await repository.getStakingPeriodStatistics(
            currentNetworkName.value.toLowerCase(),
            period.value
          );
          periodData.value = stats;
        } catch (error) {
          console.error('Failed to get staking period statistics', error);
        }
      }
    },
    { immediate: true }
  );

  return { dappStatistics };
}
