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
      <h1
        class="
          md:tw-mr-10
          tw-text-3xl tw-font-extrabold tw-text-blue-900
          dark:tw-text-white
          tw-mb-6
          sm:tw-mb-8
        "
      >
        {{ $t('balance.balance') }}
      </h1>
      <Tab :labels="[{ label: 'Wallet', path: 'wallet' }]" />
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Tab from 'components/common/Tab.vue';

export default defineComponent({
  components: {
    Tab,
  },
  setup() {
    useMeta({ title: 'Balance' });
  },
});
</script>
<style>
.dark\:tw-bg-blue-500 {
  background-color: rgba(27, 109, 193, 0.1) !important;
}
.checked\:tw-border-blue-500:checked {
  border-color: rgba(27, 109, 193, 1) !important;
}
</style>
