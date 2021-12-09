import { LOCAL_STORAGE } from './../config/localStorage';
import BN from 'bn.js';
import { endpointKey } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useChainMetadata } from '.';
import { reduceBalanceToDenom } from './helper/plasmUtils';
import { getUsdPrice } from './helper/price';

export function useTvl(api: any) {
  const store = useStore();

  const { decimal } = useChainMetadata();

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const tvlToken = ref<BN>(new BN(0));
  const tvlUsd = ref<number>(0);
  const currentNetworkIdx = Number(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));

  watch(
    [api, dapps, currentNetworkIdx],
    () => {
      const apiRef = api.value;
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
        if (currentNetworkIdx === endpointKey.SHIDEN) {
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
