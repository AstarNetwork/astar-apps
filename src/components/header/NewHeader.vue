<template>
  <astar-header title="Test">
    <ConnectButton />
    <ConnectButton />
    <MetaUpdateButton />
    <AccountButton account="abcdefhij" />
    <NetworkButton network="Astar" />

    <!-- <div v-for="(n, i) in 7" :key="i">
      <astar-text :type="`H${i + 1}`">H {{ i + 1 }}</astar-text>
    </div> -->
  </astar-header>
</template>

<script lang="ts">
import { useSidebar } from 'src/hooks';
import { defineComponent } from 'vue';
import { useStore } from 'src/store';
import ConnectButton from 'src/components/header/ConnectButton.vue';
import MetaUpdateButton from 'src/components/header/MetaUpdateButton.vue';
import AccountButton from 'src/components/header/AccountButton.vue';
import NetworkButton from 'src/components/header/NetworkButton.vue';

export default defineComponent({
  components: {
    ConnectButton,
    MetaUpdateButton,
    AccountButton,
    NetworkButton,
  },
  setup() {
    const { isOpen } = useSidebar();
    const store = useStore();

    return {
      isOpen,
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
