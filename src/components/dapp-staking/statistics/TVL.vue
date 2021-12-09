<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-mb-8 tw-w-72 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      tw-py-4 tw-pb-8 tw-px-4
      box
      xl:tw-mx-2
    "
  >
    <div class="tw-text-xl tw-font-semibold tw-mb-4">{{ $t('dappStaking.tvl') }}</div>
    <div class="tw-flex tw-flex-col tw-items-center">
      <div class="tw-font-bold" :class="tvlUsd === 0 ? 'tw-text-2xl tw-pt-1' : 'tw-text-xl'">
        <format-balance :balance="tvlToken" />
      </div>
      <div v-if="tvlUsd !== 0" class="tw-flex tw-text-xl tw-font-bold">
        <div>${{ numFormatter(tvlUsd) }}</div>
        <div class="tw-ml-1">{{ $t('usd') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { numFormatter } from 'src/hooks/helper/price';
import { useTvl, useApi } from 'src/hooks';
import FormatBalance from 'components/balance/FormatBalance.vue';
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

<style scoped>
.box {
  background: linear-gradient(83.83deg, #694ea4, #1b6dc1 37.5%, #1b6dc1 65.1%, #2ea0c4);
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
}
</style>
