import { aprToApy } from 'apr-tools';
import { $api } from 'boot/api';
import { ethers } from 'ethers';
import { ref, watchEffect } from 'vue';

export const useAprV3 = () => {
  const stakerApr = ref<number>(0);
  const stakerApy = ref<number>(0);

  const percentageToNumber = (percent: string): number => {
    return parseFloat(String(percent)) * 0.01;
  };

  const toAstr = (wei: string): number => {
    return Number(ethers.utils.formatEther(wei.replace(/,/g, '')));
  };

  watchEffect(async () => {
    const getApr = async () => {
      try {
        const api = $api!;

        const [inflation, currentEraInfo] = await Promise.all([
          api.query.inflation.inflationParams(),
          api.query.dappStaking.currentEraInfo(),
        ]);

        const inflationParams = inflation.toHuman() as {
          maxInflationRate: string;
          adjustableStakersPart: string;
          baseStakersPart: string;
          idealStakingRate: string;
        };

        const currentEraInformation = currentEraInfo.toHuman() as {
          totalLocked: string;
          currentStakeAmount: {
            voting: string;
          };
        };

        const yearlyInflation = percentageToNumber(inflationParams.maxInflationRate);
        console.log('yearlyInflation', yearlyInflation); //0.01
        const baseStakersPart = percentageToNumber(inflationParams.baseStakersPart);
        console.log('baseStakersPart', baseStakersPart); // 0.25

        const adjustableStakersPart = percentageToNumber(inflationParams.adjustableStakersPart);
        console.log('adjustableStakersPart', adjustableStakersPart); // 0.35

        const idealStakingRate = percentageToNumber(inflationParams.idealStakingRate);

        console.log('idealStakingRate', idealStakingRate); // 0.2
        console.log(
          'toAstr(currentEraInformation.currentStakeAmount.voting)',
          toAstr(currentEraInformation.currentStakeAmount.voting)
        );
        console.log(
          'toAstr(currentEraInformation.totalLocked)',
          toAstr(currentEraInformation.totalLocked)
        );

        // 58946 / 4900630.7
        const stakedPercent =
          toAstr(currentEraInformation.currentStakeAmount.voting) /
          toAstr(currentEraInformation.totalLocked);

        console.log('stakedPercent', stakedPercent); // 0.012028247575185265

        // 0.25 + 0.35 * Math.min(1, 0.012 / 0.2)
        const stakerRewardPercent =
          baseStakersPart + adjustableStakersPart * Math.min(1, stakedPercent / idealStakingRate);

        console.log('stakerRewardPercent', stakerRewardPercent); // 0.2710494332565742
        // (0.01 * 0.27) / 0.12
        const apr = (yearlyInflation * stakerRewardPercent) / stakedPercent;

        console.log('apr', apr); // 0.2253
        return 0;
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
