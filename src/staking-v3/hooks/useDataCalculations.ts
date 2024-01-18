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
      ethers.utils.formatEther(currentEraInfo.value.currentStakeAmount.totalStake)
    );

    return (totalStake / totalLocked) * 100;
  });

  return { tvlPercentage, totalVolumeOfVotesPercentage };
}
