import { computed, onMounted, ref } from 'vue';
import { useDappStaking } from './useDappStaking';
import { useTokenCirculation } from 'src/hooks/useTokenCirculation';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { DAppTierRewards, IDappStakingRepository, NumberOfStakersAndLockers } from '../logic';
import { useLeaderboard } from './useLeaderboard';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';

export function useDataCalculations() {
  const { totalSupply } = useTokenCirculation();
  const { currentEraInfo, eraLengths, tiersConfiguration, protocolState } = useDappStaking();
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

  const tokensToBeBurned = ref<bigint>();

  const calculateTotalTokensToBeBurned = async (block?: number): Promise<bigint | undefined> => {
    let protocolStateForCalculation = protocolState.value;
    if (block) {
      const dappStakingRepository = container.get<IDappStakingRepository>(
        Symbols.DappStakingRepositoryV3
      );
      protocolStateForCalculation = await dappStakingRepository.getProtocolState(block);
    }

    if (protocolStateForCalculation) {
      try {
        // Determine current period boundaries so we can fetch dApp tiers.
        const lastPeriodEra = protocolStateForCalculation.periodInfo.nextSubperiodStartEra - 1;
        const firstPeriodEra = lastPeriodEra - eraLengths.value.standardErasPerBuildAndEarnPeriod;
        const currentEra = protocolStateForCalculation.era;

        const leaderboardRequests = [];
        const dappStakingRepository = container.get<IDappStakingRepository>(
          Symbols.DappStakingRepositoryV3
        );

        // Fetch dApp tiers.
        // +1 because there is no dApp tiers info for the first era of a period.
        for (let era = firstPeriodEra + 1; era < currentEra; era++) {
          leaderboardRequests.push(dappStakingRepository.getDappTiers(era));
        }

        const dappTiers = await Promise.all(leaderboardRequests);

        let result = BigInt(0);

        // Calculate non allocated rewards till the current era.
        for (let dappTier of dappTiers) {
          if (dappTier) {
            result += calculateNonAllocatedRewardsForEra(dappTier);
          }
        }

        // Assume that from current era onwards, we have the same dApp tier allocation. This introduces a small error
        // in the calculation, but since we need total tokens to be burned in subperiod this is best we can do.
        // The more we are advancing in eras, the less this error will be.
        const lastDappTier = dappTiers[dappTiers.length - 1];
        if (lastDappTier) {
          for (let i = currentEra; i <= lastPeriodEra; i++) {
            result += calculateNonAllocatedRewardsForEra(lastDappTier);
          }
        }

        tokensToBeBurned.value = result;
        return result;
      } catch (error) {
        console.error('Error calculating non-allocated rewards:', error);
      }
    }
  };

  const calculateNonAllocatedRewardsForEra = (dappTierRewards: DAppTierRewards): bigint => {
    let result = BigInt(0);
    // Map of tierId to number of dApps in that tier.
    const slotsPerTier = new Map<number, number>([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
    ]);

    // Determine number of used dApp slots per tier.
    for (let dapp of dappTierRewards.dapps) {
      if (dapp.tierId) {
        const dappsInTier = slotsPerTier.get(dapp.tierId) ?? 0;
        slotsPerTier.set(dapp.tierId, dappsInTier + 1);
      }
    }

    // Calculate non-allocated rewards.
    for (let [key, value] of slotsPerTier) {
      const slotsPerTier = tiersConfiguration.value.slotsPerTier[key];
      result += dappTierRewards.rewards[key] * BigInt(slotsPerTier - value);
    }

    return result;
  };

  onMounted(() => {
    // This is a quite heavy data fetching calculation so make sure we only call it once.
    calculateTotalTokensToBeBurned();
  });

  return {
    tvlPercentage,
    totalVolumeOfVotesPercentage,
    bonusEligibleTokens,
    numberOfStakersAndLockers,
    tokensToBeBurned,
    calculateTotalTokensToBeBurned,
  };
}
