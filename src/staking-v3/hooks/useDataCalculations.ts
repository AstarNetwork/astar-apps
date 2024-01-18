import { computed } from 'vue';
import { useDappStaking } from './useDappStaking';
import { useTokenCirculation } from 'src/hooks/useTokenCirculation';
import { ethers } from 'ethers';

export function useDataCalculations() {
  const { totalSupply } = useTokenCirculation();
  const { currentEraInfo } = useDappStaking();

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

  return { tvlPercentage, totalVolumeOfVotesPercentage, bonusEligibleTokens };
}
