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
    <Address :format="AddressFormat.SS58" />
    <div class="tw-px-32">
      <div class="tw-border-b tw-border-gray-100 dark:tw-border-darkGray-600" />
    </div>
    <Address :format="AddressFormat.H160" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Address from './Address.vue';

export enum AddressFormat {
  SS58 = 'SS58',
  H160 = 'H160',
}

export default defineComponent({
  components: {
    Address,
  },
  setup() {
    return { AddressFormat };
  },
});
</script>
