<template>
  <div
    class="sm:tw-flex tw-items-end tw-border-b tw-border-gray-300 dark:tw-border-darkGray-600 tw-mb-8 tw--mx-4 sm:tw--mx-8 tw-px-4 sm:tw-px-8"
  >
    <h1
      class="tw-text-3xl tw-font-extrabold tw-text-blue-900 dark:tw-text-white tw-mb-6 sm:tw-mb-8"
    >
      Balance
    </h1>
    <Tab
      :labels="[
        { label: 'Wallet', path: 'balance-plasm' },
      ]"
    />
  </div>

  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import { useMeta } from 'vue-meta';
import Tab from 'components/common/Tab.vue';

export default defineComponent({
  components: {
    Tab,
  },
  setup() {
    // useMeta({ title: 'Balance' });
  },
});
</script>
<style>
.dark\:bg-blue-500 {
  background-color: rgba(27, 109, 193, 0.1) !important;
}
.checked\:border-blue-500:checked {
  border-color: rgba(27, 109, 193, 1) !important;
}
</style>
