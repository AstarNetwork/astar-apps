import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { ref, watch } from 'vue';
import { EraLengths } from '../logic';
import { useDappStaking } from './useDappStaking';

interface InflationParam {
  maxInflationRate: string;
  adjustableStakersPart: string;
  baseStakersPart: string;
  idealStakingRate: string;
  bonusPart: string;
}

export const useAprV3 = () => {
  const stakerApr = ref<number>(0);
  const bonusApr = ref<number>(0);
  const { eraLengths, isVotingPeriod } = useDappStaking();

  const percentageToNumber = (percent: string): number => {
    return parseFloat(String(percent)) * 0.01;
  };

  const toAstr = (wei: string): number => {
    return Number(ethers.utils.formatEther(BigInt(wei)));
  };

  const getCyclePerYear = (eraLength: EraLengths): number => {
    const secBlockProductionRate = 12;
    const secsOneYear = 365 * 24 * 60 * 60;
    const periodLength =
      eraLength.standardErasPerBuildAndEarnPeriod + eraLength.standardErasPerVotingPeriod;

    // Todo: fetched it by API
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
      if (!eraLengthRef.standardEraLength) {
        return { stakerApr: 0, bonusApr: 0 };
      }

      const [inflation, currentEraInfo, totalIssuanceRaw] = await Promise.all([
        apiRef.query.inflation.inflationParams(),
        apiRef.query.dappStaking.currentEraInfo(),
        apiRef.query.balances.totalIssuance(),
      ]);

      const inflationParams = inflation.toHuman() as unknown as InflationParam;
      const currentEraInformation = JSON.parse(currentEraInfo.toString());
      const totalIssuance = Number(ethers.utils.formatEther(totalIssuanceRaw.toString()));

      const yearlyInflation = percentageToNumber(inflationParams.maxInflationRate);
      const baseStakersPart = percentageToNumber(inflationParams.baseStakersPart);
      const adjustableStakersPart = percentageToNumber(inflationParams.adjustableStakersPart);
      const idealStakingRate = percentageToNumber(inflationParams.idealStakingRate);
      const bonusPart = percentageToNumber(inflationParams.bonusPart);

      const cyclesPerYear = getCyclePerYear(eraLengthRef);
      const currentStakeAmount = isVotingPeriod.value
        ? toAstr(currentEraInformation.nextStakeAmount.voting)
        : toAstr(currentEraInformation.currentStakeAmount.voting) +
          toAstr(currentEraInformation.currentStakeAmount.buildAndEarn);

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
    [isVotingPeriod, eraLengths],
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
