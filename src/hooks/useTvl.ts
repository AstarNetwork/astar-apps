import { ApiPromise } from '@polkadot/api';
import BN from 'bn.js';
import { $isEnableIndividualClaim } from 'boot/api';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useChainMetadata } from '.';
import { getUsdPrice } from './helper/price';

export function useTvl(api: any) {
  const store = useStore();
  const { decimal } = useChainMetadata();

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const tvlToken = ref<BN>(new BN(0));
  const tvlUsd = ref<number>(0);
  const tokenSymbol = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });
  const isSendingTx = computed(() => store.getters['general/isLoading']);

  watch(
    [dapps, tokenSymbol, isSendingTx],
    () => {
      const dappsRef = dapps.value;
      const tokenSymbolRef = tokenSymbol.value;
      if (!api || !dappsRef || !tokenSymbolRef) return;

      const getTvl = async (): Promise<{ tvl: BN; tvlDefaultUnit: number }> => {
        const isEnableIndividualClaim = $isEnableIndividualClaim.value;
        const era = await api.query.dappsStaking.currentEra();
        const result = isEnableIndividualClaim
          ? await api.query.dappsStaking.generalEraInfo(era)
          : await api.query.dappsStaking.eraRewardsAndStakes(era);

        const tvl = isEnableIndividualClaim
          ? result.unwrap().locked
          : result.unwrap().staked.valueOf();

        const tvlDefaultUnit = Number(ethers.utils.formatUnits(tvl.toString(), decimal.value));
        return { tvl, tvlDefaultUnit };
      };

      const priceUsd = async (): Promise<number> => {
        if (tokenSymbolRef === 'SDN' || tokenSymbolRef === 'ASTR') {
          try {
            const coingeckoTicker = tokenSymbolRef === 'SDN' ? 'shiden' : 'astar';
            return await getUsdPrice(coingeckoTicker);
          } catch (error) {
            console.error(error);
            return 0;
          }
        }
        return 0;
      };

      api.isReady.then(() => {
        (async () => {
          const results = await Promise.all([getTvl(), priceUsd()]);
          const { tvl, tvlDefaultUnit } = results[0];
          console.log('tvl', tvl, tvlDefaultUnit);
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
