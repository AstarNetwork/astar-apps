import { u128 } from '@polkadot/types';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { container } from 'src/v2/common';
import { IInflationRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { computed, ref, watch } from 'vue';
import { EraInfo, EraLengths, InflationParam } from '../logic';
import { useDappStaking } from './useDappStaking';

export const useAprV3 = ({ isWatch }: { isWatch: boolean }) => {
  const stakerApr = ref<number>(0);
  const bonusApr = ref<number>(0);
  const { eraLengths, isVotingPeriod, currentEraInfo, stakerInfo } = useDappStaking();

  const percentageToNumber = (percent: string): number => {
    // e.g.: percent 1%: 10000000000000000
    return Number(percent) * 0.0000000000000001 * 0.01;
  };

  const toAstr = (wei: bigint): number => {
    return Number(ethers.utils.formatEther(String(wei)));
  };

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

  const getStakerApr = ({
    totalIssuance,
    inflationParams,
    currentEraInfo,
    eraLength,
  }: {
    totalIssuance: u128;
    inflationParams: InflationParam;
    currentEraInfo: EraInfo;
    eraLength: EraLengths;
  }): number => {
    const numTotalIssuance = Number(ethers.utils.formatEther(totalIssuance.toString()));
    const yearlyInflation = percentageToNumber(inflationParams.maxInflationRate);
    const baseStakersPart = percentageToNumber(inflationParams.baseStakersPart);
    const adjustableStakersPart = percentageToNumber(inflationParams.adjustableStakersPart);
    const idealStakingRate = percentageToNumber(inflationParams.idealStakingRate);

    const cyclesPerYear = getCyclePerYear(eraLength);
    const currentStakeAmount = isVotingPeriod.value
      ? toAstr(currentEraInfo!.nextStakeAmount!.voting)
      : toAstr(currentEraInfo.currentStakeAmount.voting) +
        toAstr(currentEraInfo.currentStakeAmount.buildAndEarn);

    const stakedPercent = currentStakeAmount / numTotalIssuance;
    const stakerRewardPercent =
      baseStakersPart + adjustableStakersPart * Math.min(1, stakedPercent / idealStakingRate);

    const stakerApr =
      ((yearlyInflation * stakerRewardPercent) / stakedPercent) * cyclesPerYear * 100;
    return stakerApr;
  };

  const getBonusApr = ({
    currentEraInfo,
    eraLength,
    bonusRewardsPoolPerPeriod,
    // Memo: Any amount can be simulated for calculating APR
    simulatedVoteAmount = 1000,
  }: {
    currentEraInfo: EraInfo;
    eraLength: EraLengths;
    bonusRewardsPoolPerPeriod: string;
    simulatedVoteAmount?: number;
  }): { bonusApr: number; simulatedBonusPerPeriod: number } => {
    const cyclesPerYear = getCyclePerYear(eraLength);

    const formattedBonusRewardsPoolPerPeriod = Number(
      ethers.utils.formatEther(bonusRewardsPoolPerPeriod)
    );

    // Memo: equivalent to 'totalVpStake' in the runtime query
    const voteAmount = isVotingPeriod.value
      ? toAstr(currentEraInfo.nextStakeAmount!.voting)
      : toAstr(currentEraInfo.currentStakeAmount.voting);

    const bonusPercentPerPeriod = formattedBonusRewardsPoolPerPeriod / voteAmount;
    const simulatedBonusPerPeriod = simulatedVoteAmount * bonusPercentPerPeriod;
    const periodsPerYear = periodsPerCycle.value * cyclesPerYear;
    const simulatedBonusAmountPerYear = simulatedBonusPerPeriod * periodsPerYear;
    const bonusApr = (simulatedBonusAmountPerYear / simulatedVoteAmount) * 100;
    return { bonusApr, simulatedBonusPerPeriod };
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

      const inflationRepo = container.get<IInflationRepository>(Symbols.InflationRepository);
      const [inflationParams, inflationConfiguration, totalIssuanceRaw] = await Promise.all([
        inflationRepo.getInflationParams(),
        inflationRepo.getInflationConfiguration(),
        apiRef.query.balances.totalIssuance(),
      ]);

      const bonusRewardsPoolPerPeriod = inflationConfiguration.bonusRewardPoolPerPeriod.toString();

      const stakerApr = getStakerApr({
        totalIssuance: totalIssuanceRaw,
        inflationParams,
        currentEraInfo: currentEraInfoRef,
        eraLength: eraLengthRef,
      });

      const { bonusApr } = getBonusApr({
        currentEraInfo: currentEraInfoRef,
        eraLength: eraLengthRef,
        bonusRewardsPoolPerPeriod,
      });

      return { stakerApr, bonusApr };
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

      const inflationRepo = container.get<IInflationRepository>(Symbols.InflationRepository);
      const inflationConfiguration = await inflationRepo.getInflationConfiguration();
      const bonusRewardsPoolPerPeriod = inflationConfiguration.bonusRewardPoolPerPeriod.toString();

      const { simulatedBonusPerPeriod } = getBonusApr({
        currentEraInfo: currentEraInfoRef,
        eraLength: eraLengthRef,
        bonusRewardsPoolPerPeriod,
        simulatedVoteAmount: Number(ethers.utils.formatEther(stakedBonusEligible)),
      });

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
