<template>
  <div
    class="
      sm:tw-flex
      tw-items-end tw-border-b tw-border-gray-300
      dark:tw-border-darkGray-600
      tw-mb-8 tw--mx-4
      sm:tw--mx-8
      tw-px-4
      sm:tw-px-8
    "
  >
    <h1
      class="
        md:tw-mr-10
        tw-text-3xl tw-font-extrabold tw-text-blue-900
        dark:tw-text-white
        tw-mb-6
        sm:tw-mb-8
      "
    >
      {{ $t('store.dappsStore') }}
    </h1>
    <div class="tw-flex">
      <Tab :labels="[{ label: 'Discover', path: 'discover-dapps' }]" />
      <Tab :labels="[{ label: 'Manage', path: 'manage-dapps' }]" />
    </div>
  </div>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Tab from 'components/common/Tab.vue';

export default defineComponent({
  components: { Tab },
});
</script>
