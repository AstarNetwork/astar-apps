<template>
  <div class="tw-text-sm tw-text-blue-900 dark:tw-text-white">
    <div class="tw-flex">
      <span class="tw-mr-1">TVL:</span>
      <format-balance :balance="tvlToken" />
      <span v-if="tvlUsd" class="tw-ml-1">${{ numFormatter(tvlUsd) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useTvl, useApi } from 'src/hooks';
import FormatBalance from 'components/balance/FormatBalance.vue';
import { numFormatter } from 'src/hooks/helper/price';

export default defineComponent({
  components: { FormatBalance },
  setup() {
    const { api } = useApi();
    const { tvlToken, tvlUsd } = useTvl(api);

    return {
      tvlToken,
      tvlUsd,
      numFormatter,
    };
  },
});
</script>
