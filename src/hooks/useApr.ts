import axios from 'axios';
import { aprToApy } from 'apr-tools';
import { $api } from 'boot/api';
import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';

export const useApr = () => {
  const store = useStore();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const dapps = computed(() => store.getters['dapps/getAllDapps']);
  const stakerApr = ref<number>(0);
  const stakerApy = ref<number>(0);

  const getApr = async (): Promise<number> => {
    try {
      const url = `${providerEndpoints[currentNetworkIdx.value].baseApiUrl}/dapps-staking/apr`;

      if (url) {
        const { data } = await axios.get(url);
        const apr = Number(data);

        stakerApr.value = apr;
        stakerApy.value = aprToApy(stakerApr.value);

        return apr;
      }

      return 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  watchEffect(() => {
    getApr();
  });

  return {
    stakerApr,
    stakerApy,
  };
};
