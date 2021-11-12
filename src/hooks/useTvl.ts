import BN from 'bn.js';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useChainMetadata } from '.';
import { reduceBalanceToDenom } from './helper/plasmUtils';
import { getUsdPrice } from './helper/price';

export function useTvl(api: any) {
  const store = useStore();

  const { decimal, defaultUnitToken } = useChainMetadata();

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const tvlToken = ref<BN>(new BN(0));
  const tvlUsd = ref<number>(0);

  watch(
    [api, dapps, defaultUnitToken.value],
    () => {
      const apiRef = api && api.value;
      const dappsRef = dapps.value;
      if (!apiRef || !dappsRef) return;

      const getTvl = async (): Promise<{ tvl: BN; tvlDefaultUnit: number }> => {
        const era = await apiRef.query.dappsStaking.currentEra();
        const result = await apiRef.query.dappsStaking.eraRewardsAndStakes(era);
        const tvl = result.unwrap().staked.valueOf();
        const tvlDefaultUnit = Number(reduceBalanceToDenom(tvl, decimal.value));
        return { tvl, tvlDefaultUnit };
      };

      const priceUsd = async (): Promise<number> => {
        if (defaultUnitToken.value === 'SDN') {
          try {
            return await getUsdPrice('shiden');
          } catch (error) {
            console.error(error);
            return 0;
          }
        }
        return 0;
      };

      apiRef.isReady.then(() => {
        (async () => {
          const results = await Promise.all([getTvl(), priceUsd()]);
          const { tvl, tvlDefaultUnit } = results[0];
          const usd = results[1];
          tvlToken.value = tvl;
          tvlUsd.value = usd * tvlDefaultUnit;
        })();
      });
    },
    { immediate: true }
  );
  return {
    tvlToken,
    tvlUsd,
  };
}
