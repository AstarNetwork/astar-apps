<template>
  <div
    class="
      tw-flex tw-justify-between tw-items-center
      lg:tw-hidden
      tw-px-4 tw-py-1
      sm:tw-py-2
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-shadow
    "
  >
    <button class="open-sidebar" @click="isOpen = true">
      <span class="tw-sr-only">Open sidebar</span>
      <!-- Heroicon name: outline/menu -->
      <icon-base
        class="
          tw-h-6 tw-w-6 tw-text-gray-500
          dark:tw-text-darkGray-300
          group-hover:tw-text-blue-900
        "
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <icon-outline-menu />
      </icon-base>
    </button>

    <div class="tw-flex tw-items-center tw-justify-center">
      <div v-if="currentNetworkIdx === endpointKey.SHIDEN" class="tw-py-2">
        <img width="190" src="~assets/img/shiden.png" />
      </div>
      <div v-else-if="currentNetworkIdx === endpointKey.SHIBUYA" class="tw-py-2">
        <img width="190" src="~assets/img/shibuya.svg" />
      </div>
      <img v-else width="200" src="~assets/img/astar.png" />
    </div>

    <div class="tw-w-8 tw-h-8"></div>
  </div>
</template>

<script lang="ts">
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useSidebar } from 'src/hooks';
import { defineComponent } from 'vue';
import IconBase from '../icons/IconBase.vue';
import IconOutlineMenu from '../icons/IconOutlineMenu.vue';
export default defineComponent({
  components: { IconBase, IconOutlineMenu },
  setup() {
    const { isOpen } = useSidebar();

    const currentNetworkIdx = Number(localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX));

    return {
      isOpen,
      currentNetworkIdx,
      endpointKey,
    };
  },
});
</script>

<style scoped>
.open-sidebar {
  @apply tw--ml-3 tw-p-2 tw-rounded-full tw-group;
}
.open-sidebar:hover {
  @apply tw-bg-blue-100 dark:tw-bg-darkGray-600 tw-text-gray-900;
}
.open-sidebar:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 tw-bg-blue-50;
}
</style>
