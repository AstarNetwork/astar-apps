import { computed } from 'vue';
import { useDappStaking } from './useDappStaking';
import { useTokenCirculation } from 'src/hooks/useTokenCirculation';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { NumberOfStakersAndLockers } from '../logic';
import { useLeaderboard } from './useLeaderboard';

export function useDataCalculations() {
  const { totalSupply } = useTokenCirculation();
  const { currentEraInfo, eraLengths, dAppTiers, tiersConfiguration } = useDappStaking();
  const store = useStore();

  const tvlPercentage = computed<number>(() => {
    if (!currentEraInfo.value || !totalSupply.value) {
      return 0;
    }

    const totalLocked = Number(ethers.utils.formatEther(currentEraInfo.value.totalLocked));

    return (totalLocked / totalSupply.value) * 100;
  });

  const totalVolumeOfVotesPercentage = computed<number>(() => {
    if (!currentEraInfo.value) {
      return 0;
    }

    const totalLocked = Number(ethers.utils.formatEther(currentEraInfo.value.totalLocked));
    const totalStake = Number(
      ethers.utils.formatEther(
        currentEraInfo.value.nextStakeAmount
          ? currentEraInfo.value.nextStakeAmount?.totalStake
          : currentEraInfo.value.currentStakeAmount.totalStake
      )
    );

    return (totalStake / totalLocked) * 100;
  });

  const bonusEligibleTokens = computed<bigint>(() => {
    if (!currentEraInfo.value) {
      return BigInt(0);
    }

    return currentEraInfo.value.nextStakeAmount
      ? currentEraInfo.value.nextStakeAmount.voting
      : currentEraInfo.value.currentStakeAmount.voting;
  });

  const numberOfStakersAndLockers = computed<NumberOfStakersAndLockers>(
    () => store.getters['stakingV3/getNumberOfStakersAndLockers']
  );

  const { leaderBoards } = useLeaderboard();

  const tokensToBeBurned = computed(() => {
    // Calculate the sum of tokens to be burned
    const tbb = dAppTiers.value.rewards.reduce((acc: bigint, reward: bigint, i) => {
      const slotsPerTier = tiersConfiguration.value.slotsPerTier[i];
      const dappsInTier = leaderBoards.value.get(i + 1)?.length ?? 0;
      const tokensForTier =
        ((reward * (BigInt(slotsPerTier) - BigInt(dappsInTier))) / BigInt(slotsPerTier)) *
        BigInt(eraLengths.value.standardErasPerBuildAndEarnPeriod);

      return acc + tokensForTier;
    }, BigInt(0));

    return tbb.toString();
  });

  return {
    tvlPercentage,
    totalVolumeOfVotesPercentage,
    bonusEligibleTokens,
    numberOfStakersAndLockers,
    tokensToBeBurned,
  };
}
