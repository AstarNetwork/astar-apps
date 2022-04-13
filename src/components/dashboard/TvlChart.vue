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
import { defineComponent, ref, watch, watchEffect } from 'vue';
import axios from 'axios';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';
import { ChartData } from 'src/components/dashboard/ChartData';
import { API_URL, formatNumber } from 'src/components/dashboard/utils';
import { DEFAULT_FILTER } from 'src/components/dashboard/ChartFilter.vue';

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
    const data = ref<ChartData>([[1, 1]]);
    const currentTvl = ref<string>('');
    const currentFilter = ref<string>(DEFAULT_FILTER);

    const mergeArray = ({
      ecosystem,
      dappStaking,
    }: {
      ecosystem: [number, number];
      dappStaking: [string, number];
    }) => {
      const dappStakingLength = dappStaking.length;
    };

    const loadData = async (): Promise<void> => {
      if (!props.network) return;
      const ecosystemTvlUrl = `${API_URL}/v1/${props.network.toLowerCase()}/token/tvl/${
        currentFilter.value
      }`;

      const dappStakingTvlUrl = `${API_URL}/v1/${props.network.toLowerCase()}/dapps-staking/tvl/${
        currentFilter.value
      }`;

      const [ecosystem, dappStaking] = await Promise.all([
        axios.get<ChartData>(ecosystemTvlUrl),
        axios.get<ChartData>(dappStakingTvlUrl),
      ]);

      console.log('ecosystem', ecosystem.data);
      console.log('dappStaking', dappStaking.data);

      // console.log('result.data', result.data);
      data.value = ecosystem.data.map((pair) => {
        return [Number(pair[0]) * 1000, pair[1]];
      });
      console.log('data.value', data.value);

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

    // watchEffect(() => {
    //   console.log('data', data.value);
    //   console.log('currentTvl', currentTvl.value);
    // });

    return {
      data,
      currentTvl,
      handleFilterChanged,
    };
  },
});
</script>
