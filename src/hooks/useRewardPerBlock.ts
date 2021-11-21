import { BigNumber } from 'bignumber.js';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useChainMetadata } from '.';
import { defaultAmountWithDecimals } from './helper/plasmUtils';
import { getUsdPrice } from './helper/price';
import { useApi } from './useApi';

export function useRewardsPerBlock() {
  const store = useStore();
  const { api } = useApi();
  const { decimal } = useChainMetadata();

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const blockRewardsPerDapps = ref<number>(0);
  const tokenPrice = ref<number>(0);

  watch(
    [api, dapps, decimal],
    () => {
      const apiRef = api && api.value;
      const dappsRef = dapps.value;
      const numberOfDapps = new BigNumber(dapps.value.length);

      if (!apiRef || !dappsRef || numberOfDapps.toString() === '0') return;

      const getRewardsPerDapps = async (): Promise<number> => {
        try {
          const rawBlockRewards = await apiRef.consts.blockReward.rewardAmount.toString();
          const blockRewards = defaultAmountWithDecimals(rawBlockRewards, decimal.value);
          console.log('blockRewards: ', blockRewards); // -> 2.664 (SDN)

          const stakerRatio = new BigNumber(0.5);
          const ttlRewardsForStakers = new BigNumber(blockRewards).times(stakerRatio);
          console.log('ttlRewardsForStakers: ', ttlRewardsForStakers.toString()); // -> 1.332 (SDN)

          const rewardsPerDapps = ttlRewardsForStakers.div(numberOfDapps);
          console.log('rewardsPerDapps: ', rewardsPerDapps.toString()); // -> 1.332 / 18 = 0.074 SDN

          return rewardsPerDapps.toNumber();
        } catch (error) {
          console.error(error);
          return 0;
        }
      };

      const priceUsd = async (): Promise<number> => {
        const chainName = await apiRef.runtimeVersion.specName.toString();
        if (chainName === 'shiden') {
          try {
            return await getUsdPrice(chainName);
          } catch (error) {
            console.error(error);
            return 0;
          }
        }
        return 0;
      };

      apiRef.isReady.then(() => {
        (async () => {
          if (numberOfDapps.toString() === '0') return;

          const results = await Promise.all([getRewardsPerDapps(), priceUsd()]);
          blockRewardsPerDapps.value = results[0];
          console.log('blockRewardsPerDapps.value: ', blockRewardsPerDapps.value); // ->0.074 SDN
          tokenPrice.value = results[1];
          console.log('results[1]: ', results[1]); // -> 2.75 (USD)
        })();
      });
    },
    { immediate: true }
  );
  return {
    blockRewardsPerDapps,
    tokenPrice,
  };
}
