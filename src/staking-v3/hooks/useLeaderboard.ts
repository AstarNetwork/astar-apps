import { watch, ref, computed, onMounted } from 'vue';
import { CombinedDappInfo, PeriodType, useDappStaking, useDapps } from '..';
import { useStore } from 'src/store';
import { getDomain } from 'src/v2/common';

export interface LeaderboardData {
  address: string;
  rank: number;
  name: string;
  iconUrl: string;
  url: string;
  value: bigint;
}

export function useLeaderboard() {
  const store = useStore();
  const { registeredDapps, dappsStats, fetchDappStats } = useDapps();
  const { dAppTiers, protocolState, eraLengths } = useDappStaking();
  // Map key is a dApp tier.
  const leaderBoards = ref<Map<number, CombinedDappInfo[]>>(new Map());
  const leaderboard = computed<Map<number, number>>(
    () => store.getters['stakingV3/getLeaderboard']
  );

  // Leaderboard is empty if we are in the voting period or if we are in the first era of the build and earn period.
  const isLeaderboardEmpty = computed<boolean>(
    () =>
      protocolState.value !== undefined &&
      (protocolState.value.periodInfo.subperiod === PeriodType.Voting ||
        (protocolState.value.periodInfo.subperiod === PeriodType.BuildAndEarn &&
          protocolState.value.era ===
            protocolState.value.periodInfo.nextSubperiodStartEra -
              eraLengths.value.standardErasPerBuildAndEarnPeriod))
  );

  const sortedDapps = computed<CombinedDappInfo[]>(() =>
    registeredDapps.value.sort((a, b) => {
      const valueA = a.chain?.totalStake ?? BigInt(0);
      const valueB = b.chain?.totalStake ?? BigInt(0);

      // memo couldn't do return valueB - valueA because it's a bigint.
      if (valueA < valueB) {
        return 1;
      } else if (valueA > valueB) {
        return -1;
      } else {
        return 0;
      }
    })
  );

  const calculateLeaderboard = (): void => {
    console.log('Calculating leaderboard');
    leaderBoards.value = new Map([
      [1, []],
      [2, []],
      [3, []],
      [4, []],
    ]);

    sortedDapps.value.forEach((dapp) => {
      const tier = leaderboard.value.get(dapp.chain.id);
      tier !== undefined && leaderBoards.value.get(tier + 1)?.push(dapp);
    });
  };

  const getDailyReward = (tier: number): bigint => dAppTiers.value.rewards[tier - 1] ?? BigInt(0);

  const dappsPerPage = 5;
  const paginatedStakeRankingVoting = computed<LeaderboardData[][]>(() => {
    const result: LeaderboardData[][] = [];
    for (let i = 0; i < sortedDapps.value.length; i += dappsPerPage) {
      result.push(
        sortedDapps.value
          .slice(i, i + dappsPerPage)
          .map((dapp, index) =>
            getLeaderboardData(
              index + 1 + i * dappsPerPage,
              dapp.basic.address,
              dapp.basic.name,
              dapp.basic.iconUrl,
              dapp.basic.url,
              dapp.chain.totalStake ?? BigInt(0)
            )
          )
      );
    }
    return result;
  });

  const paginatedTransactionsRanking = ref<LeaderboardData[][]>([]);
  const paginatedUsersRanking = ref<LeaderboardData[][]>([]);

  const calculatePaginatedTransactionsAndUsersRanking = (): void => {
    paginatedTransactionsRanking.value = [];
    paginatedUsersRanking.value = [];

    for (let i = 0; i < sortedDapps.value.length; i += dappsPerPage) {
      const [transactions, users] = sortedDapps.value
        .slice(i, i + dappsPerPage)
        .map((dapp, index) => {
          const stats = dappsStats.value.find(
            (x) =>
              x.name.toLowerCase() === dapp.basic.name.toLowerCase() ||
              getDomain(x.url.toLowerCase()) === getDomain(dapp.basic.url.toLowerCase())
          );

          if (stats) {
            return [
              getLeaderboardData(
                index + 1 + i * dappsPerPage,
                dapp.basic.address,
                dapp.basic.name,
                dapp.basic.iconUrl,
                dapp.basic.url,
                BigInt(stats.metrics.transactions)
              ),
              getLeaderboardData(
                index + 1 + i * dappsPerPage,
                dapp.basic.address,
                dapp.basic.name,
                dapp.basic.iconUrl,
                dapp.basic.url,
                BigInt(stats.metrics.uaw)
              ),
            ];
          }
        });

      transactions && paginatedTransactionsRanking.value.push(transactions);
      users && paginatedUsersRanking.value.push(users);
    }
  };

  const getLeaderboardData = (
    rank: number,
    address: string,
    name: string,
    iconUrl: string,
    url: string,
    value: bigint
  ): LeaderboardData => ({
    rank,
    address,
    name,
    iconUrl,
    url,
    value,
  });

  onMounted(() => {
    fetchDappStats();
  });

  watch(
    registeredDapps,
    () => {
      calculateLeaderboard();
    },
    { immediate: true }
  );

  watch(
    dappsStats,
    () => {
      calculatePaginatedTransactionsAndUsersRanking();
    },
    { immediate: true }
  );

  return {
    leaderBoards,
    isLeaderboardEmpty,
    sortedDapps,
    dappsPerPage,
    paginatedStakeRankingVoting,
    paginatedTransactionsRanking,
    paginatedUsersRanking,
    getDailyReward,
  };
}
