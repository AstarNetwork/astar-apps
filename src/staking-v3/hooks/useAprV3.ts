import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { ref, watch } from 'vue';
import { EraLengths, IDappStakingRepository } from '../logic';
import { useDappStaking } from './useDappStaking';

export const useAprV3 = () => {
  const stakerApr = ref<number>(0);
  const bonusApr = ref<number>(0);
  const { eraLengths, isVotingPeriod, currentEraInfo } = useDappStaking();

  const percentageToNumber = (percent: string): number => {
    // e.g.: percent 1%: 10000000000000000
    return Number(percent) * 0.0000000000000001 * 0.01;
  };

  const toAstr = (wei: bigint): number => {
    return Number(ethers.utils.formatEther(String(wei)));
  };

  const getCyclePerYear = (eraLength: EraLengths): number => {
    const secBlockProductionRate = 12;
    const secsOneYear = 365 * 24 * 60 * 60;
    const periodLength =
      eraLength.standardErasPerBuildAndEarnPeriod + eraLength.standardErasPerVotingPeriod;

    // Todo: fetch it via API
    const periodsPerCycle = 2;
    const eraPerCycle = periodLength * periodsPerCycle;
    const blocksStandardEraLength = eraLength.standardEraLength;
    const blockPerCycle = blocksStandardEraLength * eraPerCycle;
    const cyclePerYear = secsOneYear / secBlockProductionRate / blockPerCycle;
    return cyclePerYear;
  };

  const getApr = async (): Promise<{ stakerApr: number; bonusApr: number }> => {
    try {
      const apiRef = $api!;
      const eraLengthRef = eraLengths.value;
      const currentEraInfoRef = currentEraInfo.value;
      if (
        !eraLengthRef.standardEraLength ||
        !currentEraInfoRef ||
        !currentEraInfoRef.nextStakeAmount
      ) {
        return { stakerApr: 0, bonusApr: 0 };
      }

      const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
      const [inflationParams, totalIssuanceRaw] = await Promise.all([
        stakingRepo.getInflationParams(),
        apiRef.query.balances.totalIssuance(),
      ]);

      const totalIssuance = Number(ethers.utils.formatEther(totalIssuanceRaw.toString()));

      const yearlyInflation = percentageToNumber(inflationParams.maxInflationRate);
      const baseStakersPart = percentageToNumber(inflationParams.baseStakersPart);
      const adjustableStakersPart = percentageToNumber(inflationParams.adjustableStakersPart);
      const idealStakingRate = percentageToNumber(inflationParams.idealStakingRate);

      const cyclesPerYear = getCyclePerYear(eraLengthRef);
      const currentStakeAmount = isVotingPeriod.value
        ? toAstr(currentEraInfoRef.nextStakeAmount.voting)
        : toAstr(currentEraInfoRef.currentStakeAmount.voting) +
          toAstr(currentEraInfoRef.currentStakeAmount.buildAndEarn);

      const stakedPercent = currentStakeAmount / totalIssuance;
      const stakerRewardPercent =
        baseStakersPart + adjustableStakersPart * Math.min(1, stakedPercent / idealStakingRate);

      const stakerApr =
        ((yearlyInflation * stakerRewardPercent) / stakedPercent) * cyclesPerYear * 100;

      // Todo: Update it
      const bonusApr = 0;

      return { stakerApr, bonusApr };
    } catch (error) {
      return { stakerApr: 0, bonusApr: 0 };
    }
  };

  watch(
    [isVotingPeriod, eraLengths, currentEraInfo],
    async () => {
      const apr = await getApr();
      stakerApr.value = apr.stakerApr;
      bonusApr.value = apr.bonusApr;
    },
    { immediate: true }
  );

  return {
    stakerApr,
    bonusApr,
  };
};
