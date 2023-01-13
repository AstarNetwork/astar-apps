<template>
  <div v-if="!currentCirculating">
    <q-skeleton class="skeleton--value-panel" />
  </div>
  <div v-else class="wrapper--value">
    <div class="container container--value">
      <div class="row">
        <span class="text--accent container--title--color">{{
          $t('dashboard.circulating.circulatingSupply')
        }}</span>
      </div>
      <div class="align-right text--xlg">
        <div>
          <span class="text--value text-color--neon">
            {{ $n(currentCirculating) }} {{ symbol }}
          </span>
        </div>
        <div>
          <span class="text--label">
            {{ $t('dashboard.circulating.supply', { totalSupply: formatNumber(totalSupply, 3) }) }}
          </span>
          <span class="text--label text-color--neon">
            {{ ((currentCirculating / totalSupply) * 100).toFixed(0) }} %
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { formatNumber, TOKEN_API_URL } from '@astar-network/astar-sdk-core';
import { defineComponent, ref, watchEffect } from 'vue';
import { QSkeleton } from 'quasar';

interface StatsData {
  generatedAt: number;
  totalSupply: number;
  circulatingSupply: number;
}

export default defineComponent({
  props: {
    symbol: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
  },
  setup(props) {
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

    watchEffect(async () => {
      try {
        if (props.network) {
          await loadStats(props.network.toLowerCase());
        }
      } catch (error) {
        console.error(error);
      }
    });

    return { formatNumber, totalSupply, currentCirculating };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dashboard/styles/dashboard.scss';
</style>
