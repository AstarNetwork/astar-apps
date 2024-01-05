import { aprToApy } from 'apr-tools';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { ref, watchEffect } from 'vue';
import { useDappStaking } from './useDappStaking';

export const useAprV3 = () => {
  const stakerApr = ref<number>(0);
  const stakerApy = ref<number>(0);
  const { eraLengths, protocolState } = useDappStaking();

  const percentageToNumber = (percent: string): number => {
    return parseFloat(String(percent)) * 0.01;
  };

  const toAstr = (wei: string): number => {
    return Number(ethers.utils.formatEther(BigInt(wei)));
  };

  watchEffect(async () => {
    const getApr = async () => {
      try {
        if (protocolState.value?.periodInfo.subperiod === 'Voting') {
          return 0;
        }
        const apiRef = $api!;

        const [inflation, currentEraInfo, totalIssuanceRaw] = await Promise.all([
          apiRef.query.inflation.inflationParams(),
          apiRef.query.dappStaking.currentEraInfo(),
          apiRef.query.balances.totalIssuance(),
        ]);

        const inflationParams = inflation.toHuman() as {
          maxInflationRate: string;
          adjustableStakersPart: string;
          baseStakersPart: string;
          idealStakingRate: string;
        };

        const currentEraInformation = JSON.parse(currentEraInfo.toString());
        const totalIssuance = Number(ethers.utils.formatEther(totalIssuanceRaw.toString()));

        console.log('currentEraInformation', currentEraInformation);
        console.log('totalIssuance', totalIssuance); // 119491326.7

        const yearlyInflation = percentageToNumber(inflationParams.maxInflationRate);
        console.log('yearlyInflation', yearlyInflation); //0.01
        const baseStakersPart = percentageToNumber(inflationParams.baseStakersPart);
        console.log('baseStakersPart', baseStakersPart); // 0.25

        const adjustableStakersPart = percentageToNumber(inflationParams.adjustableStakersPart);
        console.log('adjustableStakersPart', adjustableStakersPart); // 0.35

        const idealStakingRate = percentageToNumber(inflationParams.idealStakingRate);

        console.log('idealStakingRate', idealStakingRate); // 0.2

        const currentStakeAmount =
          toAstr(currentEraInformation.currentStakeAmount.voting) +
          toAstr(currentEraInformation.currentStakeAmount.buildAndEarn);
        console.log('currentStakeAmount', currentStakeAmount); // 67851

        // 67851 / 119491326
        const stakedPercent = currentStakeAmount / totalIssuance;

        console.log('stakedPercent', stakedPercent); // 0.00056

        // 0.25 + 0.35 * Math.min(1, 0.00056 / 0.2)
        const stakerRewardPercent =
          baseStakersPart + adjustableStakersPart * Math.min(1, stakedPercent / idealStakingRate);

        console.log('stakerRewardPercent', stakerRewardPercent); // 0.25

        const secBlockProductionRate = 12;
        console.log('eraLengths', eraLengths.value);
        const blocksStandardEraLength = 1800;
        const eraPerCycle = 56;
        const blockPerCycle = blocksStandardEraLength * eraPerCycle;
        const secsOneYear = 365 * 24 * 60 * 60;
        const cyclesPerYear = secsOneYear / secBlockProductionRate / blockPerCycle;
        console.log('cyclesPerYear', cyclesPerYear); // 26.0714

        // (0.01 * 0.2509) / 0.0005678 * 26.0714 * 100
        const apr = ((yearlyInflation * stakerRewardPercent) / stakedPercent) * cyclesPerYear * 100;

        console.log('apr (*100)', apr); // 11523
        return apr;
      } catch (error) {
        return 0;
      }
    };

    stakerApr.value = await getApr();
    stakerApy.value = aprToApy(stakerApr.value);
  });
  return {
    stakerApr,
    stakerApy,
  };
};
