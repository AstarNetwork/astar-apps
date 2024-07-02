import { watch, ref, computed } from 'vue';
import { CombinedDappInfo, DAppTier, PeriodType, useDappStaking, useDapps } from '..';
import { useStore } from 'src/store';
import { sort } from 'src/v2/common';

export function useLeaderboard() {
  const store = useStore();
  const { registeredDapps } = useDapps();
  const { dAppTiers, protocolState, eraLengths } = useDappStaking();
  // Map key is a dApp tier.
  const leaderBoards = ref<Map<number, CombinedDappInfo[]>>(new Map());
  const leaderboard = computed<Map<number, DAppTier>>(
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

      return sort(valueA, valueB);
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
      const dappTier = leaderboard.value.get(dapp.chain.id);
      dappTier !== undefined && leaderBoards.value.get(dappTier.tierId + 1)?.push(dapp);
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
