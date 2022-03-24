<template>
  <div class="tw-hidden lg:tw-flex lg:tw-flex-shrink-0">
    <div class="tw-flex tw-flex-col tw-w-64">
      <div
        class="tw-flex tw-flex-col tw-h-0 tw-flex-1 tw-shadow tw-bg-white dark:tw-bg-darkGray-800"
      >
        <SidebarCommon />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SidebarCommon from './SidebarCommon.vue';

export default defineComponent({
  components: {
    SidebarCommon,
  },
});
</script>
