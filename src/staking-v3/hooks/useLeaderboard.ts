import { watch, ref, computed } from 'vue';
import { CombinedDappInfo, PeriodType, useDappStaking, useDapps } from '..';
import { useStore } from 'src/store';

export function useLeaderboard() {
  const store = useStore();
  const { registeredDapps } = useDapps();
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
    [...registeredDapps.value].sort((a, b) => {
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

  watch(
    registeredDapps,
    () => {
      calculateLeaderboard();
    },
    { immediate: true }
  );

  return { leaderBoards, isLeaderboardEmpty, sortedDapps, getDailyReward };
}
