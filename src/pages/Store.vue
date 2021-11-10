<template>
  <div>
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
      <div class="md:tw-mr-10 tw-mb-2">
        <h1 class="tw-text-3xl tw-font-extrabold tw-text-blue-900 dark:tw-text-white tw-mb-2">
          {{ $t('store.dappsStore') }}
        </h1>
        <div v-if="dapps.length > 0">
          <Tvl />
        </div>
      </div>
      <div class="tw-flex">
        <Tab :labels="[{ label: 'Discover', path: 'discover-dapps' }]" />
        <Tab :labels="[{ label: 'Manage', path: 'manage-dapps' }]" />
      </div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import Tab from 'components/common/Tab.vue';
import Tvl from 'components/store/TVL.vue';
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
export default defineComponent({
  components: { Tab, Tvl },
  setup() {
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);

    return {
      dapps,
    };
  },
});
</script>
