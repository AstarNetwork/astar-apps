<template>
  <div
    class="
      tw-bg-blue-500
      dark:tw-bg-blue-800
      tw-text-white tw-overflow-hidden tw-shadow tw-rounded-lg
    "
  >
    <div
      class="
        tw-rounded-lg tw-px-5 tw-pt-7 tw-pb-10
        md:tw-pb-0
        tw-bg-local tw-bg-left-top tw-bg-no-repeat tw-bg-80
        md:tw-bg-88
        tw-grid tw-h-full
      "
    >
      <p class="tw-text-lg tw-font-bold">
        {{ $t('balance.totalBalance') }}
      </p>
      <p class="tw-font-semibold tw-text-center tw-items-center md:tw-mb-10 xl:tw-mb-14">
        <span class="tw-text-3xl tw-tracking-tight tw-leading-tight"
          ><format-balance :balance="accountData?.free" />
        </span>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import FormatBalance from 'components/balance/FormatBalance.vue';

export default defineComponent({
  components: {
    FormatBalance,
  },
  props: {
    accountData: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>
