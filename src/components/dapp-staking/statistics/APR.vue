<template>
  <div
    v-if="stakerApr > 0"
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-shadow tw-mb-8 tw-w-72 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      tw-py-4 tw-pb-8 tw-px-4
      box
      xl:tw-mx-2
    "
  >
    <div class="tw-text-xl tw-font-semibold tw-mb-4">
      {{ $t('dappStaking.apr') }}
    </div>
    <div class="tw-flex tw-flex-col tw-items-center">
      <div class="tw-text-5xl tw-font-semibold">{{ Number(stakerApr.toFixed(1)) }} %</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useApr } from 'src/hooks';

export default defineComponent({
  setup() {
    const { stakerApr } = useApr();

    return {
      stakerApr,
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
