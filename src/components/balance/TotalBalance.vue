<template>
  <div
    class="tw-bg-blue-500 dark:tw-bg-blue-800 tw-text-white tw-overflow-hidden tw-shadow tw-rounded-lg"
  >
    <div
      class="tw-rounded-lg tw-px-5 tw-pt-8 tw-pb-10 sm:tw-pb-0 tw-h-full tw-bg-local tw-bg-left-top tw-bg-no-repeat tw-bg-80 sm:tw-bg-88"
    >
      <p class="tw-text-lg tw-font-bold tw-mb-4 sm:tw-mb-12 lg:tw-mb-10">Total Balance</p>
      <p class="tw-font-semibold tw-text-center tw-mb-2">
        <span class="tw-text-4xl tw-tracking-tight tw-leading-tight"
          ><format-balance />
        </span>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import FormatBalance from 'components/balance/FormatBalance.vue';

export default defineComponent({
  components: {
    FormatBalance,
  },
});
</script>
