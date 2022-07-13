import { getUsdBySymbol } from 'src/hooks/helper/price';
import { ApiPromise } from '@polkadot/api';
import { Option, Struct, U32 } from '@polkadot/types-codec';
import { Balance } from '@polkadot/types/interfaces';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useChainMetadata } from '.';

// TODO typegeneration
interface EraInfo extends Struct {
  rewards: {
    stakers: Balance;
    dapps: Balance;
  };
  staked: Balance;
  locked: Balance;
}

export function useTvl(api: ApiPromise | undefined) {
  const store = useStore();
  const { decimal } = useChainMetadata();

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const tvlToken = ref<BigInt>(BigInt(0));
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

      const getTvl = async (): Promise<{ tvl: BigInt; tvlDefaultUnit: number }> => {
        const era = await api.query.dappsStaking.currentEra<U32>();
        const result = await api.query.dappsStaking.generalEraInfo<Option<EraInfo>>(era);
        const tvl = result.unwrap().locked.toBigInt();
        const tvlDefaultUnit = Number(ethers.utils.formatUnits(tvl, decimal.value));

        return { tvl, tvlDefaultUnit };
      };

      const priceUsd = async (): Promise<number> => {
        if (tokenSymbolRef === 'SDN' || tokenSymbolRef === 'ASTR') {
          try {
            return await getUsdBySymbol(tokenSymbolRef);
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
