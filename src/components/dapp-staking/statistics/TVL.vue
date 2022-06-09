<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-mb-8 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      tw-py-4 tw-pb-8 tw-px-4
      box
    "
  >
    <div class="tw-text-xl tw-font-semibold tw-mb-4">{{ $t('dappStaking.tvl') }}</div>
    <div class="tw-flex tw-flex-col tw-items-center">
      <div class="tw-font-bold" :class="tvl.tvlUsd === 0 ? 'tw-text-2xl tw-pt-1' : 'tw-text-xl'">
        <format-balance :balance="tvl.tvl" />
      </div>
      <div v-if="tvl.tvlUsd !== 0" class="tw-flex tw-text-xl tw-font-bold">
        <div>${{ numFormatter(tvl.tvlUsd) }}</div>
        <div class="tw-ml-1">{{ $t('usd') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { numFormatter } from 'src/hooks/helper/price';
import FormatBalance from 'components/common/FormatBalance.vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: { FormatBalance },
  setup() {
    const store = useStore();
    const tvl = computed(() => store.getters['dapps/getTvl']);
    store.dispatch('dapps/getTvl');

    return {
      tvl,
      numFormatter,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.box {
  background: linear-gradient(83.83deg, #694ea4, #1b6dc1 37.5%, #1b6dc1 65.1%, #2ea0c4);
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
  @media (min-width: $xl) {
    max-width: 288px;
  }
}
</style>
