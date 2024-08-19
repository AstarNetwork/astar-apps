import { Ref, watch, ref, computed } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { container } from 'src/v2/common';
import { IBalancesRepository, ITokenApiRepository, PeriodData } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { useDapps } from './useDapps';
import { DappState, IDappStakingRepository, IDappStakingService } from '../logic';
import { PERIOD1_START_BLOCKS } from 'src/constants';
import { useDappStaking } from './useDappStaking';
import { useDataCalculations } from './useDataCalculations';
import { ethers } from 'ethers';

export type DappStatistics = {
  name: string;
  iconUrl: string;
  stakeAmount: bigint;
  rewardAmount: bigint;
  address: string;
};

export function usePeriodStats(period: Ref<number>) {
  const { currentNetworkName } = useNetworkInfo();
  const { eraLengths, protocolState, currentBlock } = useDappStaking();
  const { calculateTotalTokensToBeBurned } = useDataCalculations();
  const { allDapps, getDapp } = useDapps();

  const periodData = ref<PeriodData[]>([]);
  const tvlRatio = ref<number>();
  const stakerApr = ref<number>();
  const bonusApr = ref<number>();
  const tokensToBeBurned = ref<bigint | undefined>();

  const dappStatistics = computed<DappStatistics[]>(() => {
    const combinedData = periodData.value.map((data) => {
      const dApp = getDapp(data.dappAddress);
      if (dApp && dApp.chain.state === DappState.Registered) {
        return {
          name: dApp.basic.name,
          iconUrl: dApp.basic.iconUrl,
          stakeAmount: data.stakeAmount,
          rewardAmount: data.rewardAmount,
          address: dApp.chain.address,
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

  const calculateTvlRatio = async (block: number): Promise<void> => {
    const repository = container.get<ITokenApiRepository>(Symbols.TokenApiRepository);
    const balancesRepository = container.get<IBalancesRepository>(Symbols.BalancesRepository);
    const dappStakingRepository = container.get<IDappStakingRepository>(
      Symbols.DappStakingRepositoryV3
    );

    const allDappsId = allDapps.value.map((dapp) => dapp.chain.id);
    const [stats, totalIssuance, periodInfo, stakes] = await Promise.all([
      repository.getStakingPeriodStatistics(currentNetworkName.value.toLowerCase(), period.value),
      balancesRepository.getTotalIssuance(block),
      dappStakingRepository.getCurrentEraInfo(block),
      dappStakingRepository.getContractsStake(
        allDappsId,
        getPeriodEndBlock(period.value, protocolState.value?.periodInfo.number ?? period.value)
      ),
    ]);

    // Update skates receiver from indexer although the indexer data is correct, we are using on chain data
    // This discrepancy is caused by runtime bug.
    stats.forEach((stat) => {
      const dapp = getDapp(stat.dappAddress);
      if (dapp) {
        const stake = stakes.get(dapp.chain.id);
        if (stake) {
          stat.stakeAmount = stake.staked.totalStake;
        }
      } else {
        console.warn(`Dapp ${stat.dappAddress} not found in dapps list`);
      }
    });

    periodData.value = stats;
    const issuance = Number(ethers.utils.formatEther(totalIssuance));
    const locked = Number(ethers.utils.formatEther(periodInfo.totalLocked));
    tvlRatio.value = locked / issuance;
  };

  const setTokensToBeBurned = async (block: number): Promise<void> => {
    tokensToBeBurned.value = await calculateTotalTokensToBeBurned(block);
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
        try {
          const periodEndBlock = getPeriodEndBlock(
            period.value,
            protocolState.value?.periodInfo.number ?? period.value
          );
          const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);

          const block = Math.min(periodEndBlock, currentBlock.value) - 1;
          calculateTvlRatio(block);
          setTokensToBeBurned(block);
          const [sApr, bApr] = await Promise.all([
            // Passing periodEndBlock - 1 to APR calculations is because in the last block of the period
            // everything is unstaked and all stakes are set to 0 and with 0 stake APR can't be calculated
            stakingService.getStakerApr(block),
            stakingService.getBonusApr(undefined, block),
          ]);

          stakerApr.value = sApr;
          bonusApr.value = bApr.value;
        } catch (error) {
          console.error('Failed to get staking period statistics', error);
        }
      }
    },
    { immediate: true }
  );

  return { dappStatistics, tvlRatio, stakerApr, bonusApr, tokensToBeBurned };
}
