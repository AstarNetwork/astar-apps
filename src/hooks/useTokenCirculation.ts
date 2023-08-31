import { TOKEN_API_URL, formatNumber } from '@astar-network/astar-sdk-core';
import axios from 'axios';
import { ref, watch } from 'vue';
import { useNetworkInfo } from './useNetworkInfo';

export interface StatsData {
  generatedAt: number;
  totalSupply: number;
  circulatingSupply: number;
}

export function useTokenCirculation() {
  const { currentNetworkName } = useNetworkInfo();
  const totalSupply = ref<number>(0);
  const currentCirculating = ref<number>(0);

  const loadStats = async (network: string): Promise<void> => {
    const url = `${TOKEN_API_URL}/v1/${network}/token/stats`;
    const result = await axios.get<StatsData>(url);

    if (result.data) {
      totalSupply.value = result.data.totalSupply;
      currentCirculating.value = result.data.circulatingSupply;
    }
  };

  watch(
    currentNetworkName,
    async () => {
      try {
        if (currentNetworkName.value) {
          await loadStats(currentNetworkName.value.toLowerCase());
        }
      } catch (error) {
        console.error(error);
      }
    },
    { immediate: true }
  );

  return { formatNumber, totalSupply, currentCirculating };
}
