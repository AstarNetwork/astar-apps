import { u128 } from '@polkadot/types';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { container } from 'src/v2/common';
import { IInflationRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch } from 'vue';
import { EraInfo, EraLengths, IDappStakingService, InflationParam } from '../logic';
import { useDappStaking } from './useDappStaking';
import { weiToToken } from 'src/token-utils';

export const useAprV3 = ({ isWatch }: { isWatch: boolean }) => {
  const stakerApr = ref<number>(0);
  const bonusApr = ref<number>(0);
  const { eraLengths, isVotingPeriod, currentEraInfo, stakerInfo } = useDappStaking();

  const periodsPerCycle = computed<number>(() => eraLengths.value.periodsPerCycle);

  const getCyclePerYear = (eraLength: EraLengths): number => {
    const secBlockProductionRate = 12;
    const secsOneYear = 365 * 24 * 60 * 60;
    const periodLength =
      eraLength.standardErasPerBuildAndEarnPeriod + eraLength.standardErasPerVotingPeriod;

    const eraPerCycle = periodLength * periodsPerCycle.value;
    const blocksStandardEraLength = eraLength.standardEraLength;
    const blockPerCycle = blocksStandardEraLength * eraPerCycle;
    const cyclePerYear = secsOneYear / secBlockProductionRate / blockPerCycle;
    return cyclePerYear;
  };

  const getApr = async (): Promise<{ stakerApr: number; bonusApr: number }> => {
    try {
      const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
      const [stakerApr, bonusApr] = await Promise.all([
        stakingService.getStakerApr(),
        stakingService.getBonusApr(),
      ]);

      return { stakerApr, bonusApr: bonusApr.value };
    } catch (error) {
      return { stakerApr: 0, bonusApr: 0 };
    }
  };

  const getEstimatedBonus = async (): Promise<number> => {
    try {
      const eraLengthRef = eraLengths.value;
      const currentEraInfoRef = currentEraInfo.value;
      const stakerInfoRef = stakerInfo.value;
      if (
        !stakerInfoRef ||
        !eraLengthRef.standardEraLength ||
        !currentEraInfoRef ||
        !currentEraInfoRef.nextStakeAmount
      ) {
        return 0;
      }

      let stakedBonusEligible: bigint = BigInt(0);
      stakerInfoRef.forEach((it) => {
        const amount = it.loyalStaker ? it.staked.voting : BigInt(0);
        stakedBonusEligible += amount;
      });

      if (!stakedBonusEligible) return 0;

      const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
      const { simulatedBonusPerPeriod } = await stakingService.getBonusApr(
        Number(ethers.utils.formatEther(stakedBonusEligible))
      );

      return simulatedBonusPerPeriod;
    } catch (error) {
      return 0;
    }
  };

  watch([stakerInfo], getEstimatedBonus);

  watch(
    [isVotingPeriod, eraLengths, currentEraInfo, periodsPerCycle],
    async () => {
      if (!isWatch) return;
      const apr = await getApr();
      stakerApr.value = apr.stakerApr;
      bonusApr.value = apr.bonusApr;
    },
    { immediate: true }
  );

  return {
    stakerApr,
    bonusApr,
    getEstimatedBonus,
  };
};
