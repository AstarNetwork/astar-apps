<template>
  <chart-panel
    :data="data"
    title="Total Value Locked"
    :default-value="currentTvl"
    class="wrapper--chart"
    @filter-changed="handleFilterChanged"
  />
</template>

<script lang="ts">
import axios from 'axios';
import { ChartData } from 'src/components/dashboard/ChartData';
import { DEFAULT_FILTER } from 'src/components/dashboard/ChartFilter.vue';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { API_URL, formatNumber } from 'src/components/dashboard/utils';
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  components: {
    ChartPanel,
  },
  props: {
    network: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const data = ref<number[][] | ChartData>([[1, 1]]);
    const currentTvl = ref<string>('');
    const currentFilter = ref<string>(DEFAULT_FILTER);

    // Memo: the length of ecosystem and dappStaking won't be same in some period
    const mergeArray = ({
      ecosystem,
      dappStaking,
    }: {
      ecosystem: [number, number][];
      dappStaking: [string, number][];
    }): number[][] => {
      const isDappStakingLonger = dappStaking.length >= ecosystem.length;
      if (isDappStakingLonger) {
        const data = dappStaking.map((it, i) => {
          const timestamp = Number(it[0]);
          if (ecosystem[i]) {
            const ecosystemItem = ecosystem[i];
            return [timestamp, it[1] + ecosystemItem[1]];
          } else {
            return [timestamp, it[1]];
          }
        });
        return data.reverse();
      } else {
        const data = ecosystem.map((it, i) => {
          const timestamp = it[0] * 1000;
          if (dappStaking[i]) {
            const dappStakingItem = dappStaking[i];
            return [timestamp, it[1] + dappStakingItem[1]];
          } else {
            return [timestamp, it[1]];
          }
        });
        return data.reverse();
      }
    };

    const loadData = async (): Promise<void> => {
      if (!props.network) return;
      // Source: DefiLlama API
      const ecosystemTvlUrl = `${API_URL}/v1/${props.network.toLowerCase()}/token/tvl/${
        currentFilter.value
      }`;

      const dappStakingTvlUrl = `${API_URL}/v1/${props.network.toLowerCase()}/dapps-staking/tvl/${
        currentFilter.value
      }`;

      const [ecosystem, dappStaking] = await Promise.all([
        axios.get<ChartData>(ecosystemTvlUrl),
        axios.get<[string, number][]>(dappStakingTvlUrl),
      ]);

      console.log('ecosystem', ecosystem.data);
      console.log('dappStaking', dappStaking.data);
      const mergedArray = mergeArray({
        ecosystem: ecosystem.data.reverse(),
        dappStaking: dappStaking.data.reverse(),
      });

      data.value = mergedArray;

      if (data.value && data.value.length > 0) {
        currentTvl.value = `\$${formatNumber(data.value[data.value.length - 1][1], 1)}`;
      }
    };

    const handleFilterChanged = async (filter: string): Promise<void> => {
      if (currentFilter.value !== filter) {
        currentFilter.value = filter;
        await loadData();
      }
    };

    watch([props], async () => {
      if (props.network) {
        try {
          await loadData();
        } catch (error) {
          console.error(error);
        }
      }
    });

    loadData();

    return {
      data,
      currentTvl,
      handleFilterChanged,
    };
  },
});
</script>
