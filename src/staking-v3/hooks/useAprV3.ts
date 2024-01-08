import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { ref, watch, computed } from 'vue';
import { EraInfo, EraLengths, IDappStakingRepository, InflationParam } from '../logic';
import { useDappStaking } from './useDappStaking';
import { u128 } from '@polkadot/types';
import { useNetworkInfo } from 'src/hooks';

export const useAprV3 = () => {
  const stakerApr = ref<number>(0);
  const bonusApr = ref<number>(0);
  const { eraLengths, isVotingPeriod, currentEraInfo } = useDappStaking();
  const { currentNetworkName } = useNetworkInfo();

  const percentageToNumber = (percent: string): number => {
    // e.g.: percent 1%: 10000000000000000
    return Number(percent) * 0.0000000000000001 * 0.01;
  };

  const toAstr = (wei: bigint): number => {
    return Number(ethers.utils.formatEther(String(wei)));
  };

  // Todo: fetch it via API
  const periodsPerCycle = computed<number>(() => {
    return currentNetworkName.value === 'Shibuya' ? 2 : 4;
  });

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
  }: {
    currentEraInfo: EraInfo;
    eraLength: EraLengths;
    bonusRewardsPoolPerPeriod: string;
  }): number => {
    // Memo: Any amount can be simulated
    const simulatedVoteAmount = 1000;

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
    return bonusApr;
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
      const [inflationParams, bonusRewardsPoolPerPeriod, totalIssuanceRaw] = await Promise.all([
        stakingRepo.getInflationParams(),
        stakingRepo.getBonusRewardPoolPerPeriod(),
        apiRef.query.balances.totalIssuance(),
      ]);

      const stakerApr = getStakerApr({
        totalIssuance: totalIssuanceRaw,
        inflationParams,
        currentEraInfo: currentEraInfoRef,
        eraLength: eraLengthRef,
      });

      const bonusApr = getBonusApr({
        currentEraInfo: currentEraInfoRef,
        eraLength: eraLengthRef,
        bonusRewardsPoolPerPeriod,
      });

      return { stakerApr, bonusApr };
    } catch (error) {
      return { stakerApr: 0, bonusApr: 0 };
    }
  };

  watch(
    [isVotingPeriod, eraLengths, currentEraInfo, periodsPerCycle],
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
