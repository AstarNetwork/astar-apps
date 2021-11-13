<template>
  <div
    class="
      tw-relative tw-rounded-lg tw-z-0 tw-flex tw-flex-col tw-shadow tw-bg-white
      dark:tw-bg-darkGray-800
      tw-px-1
      sm:tw-px-2
      tw-py-4 tw-gap-y-2
    "
  >
    <Address :address="address" format="SS58" />
    <div class="tw-px-32">
      <div class="tw-border-b tw-border-gray-100 dark:tw-border-darkGray-600" />
    </div>
    <Address :address="evmAddress" format="H160" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Address from './Address.vue';
import { toEvmAddress } from 'src/hooks/helper/addressUtils';
export default defineComponent({
  components: {
    Address,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    const evmAddress = toEvmAddress(props.address);
    return {
      evmAddress,
    };
  },
});
</script>
