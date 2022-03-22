<template>
  <div>
    <astar-header title="Test">
      <ConnectButton />
      <ConnectButton />
      <MetaUpdateButton />
      <AccountButton account="abcdefhij" />
      <NetworkButton network="Astar" @click="modalNetwork = true" />

      <!-- <div v-for="(n, i) in 7" :key="i">
        <astar-text :type="`H${i + 1}`">H {{ i + 1 }}</astar-text>
      </div> -->
    </astar-header>
    <!-- Modals -->
    <!-- <ModalNetwork v-if="modalNetwork" v-model:isOpen="modalNetwork" /> -->
    <astar-simple-modal title="Network" :show="modalNetwork" @close="modalNetwork = false"
      >Test</astar-simple-modal
    >
  </div>
</template>

<script lang="ts">
import { useSidebar } from 'src/hooks';
import { defineComponent, reactive, toRefs } from 'vue';
import { useStore } from 'src/store';
import ConnectButton from 'src/components/header/ConnectButton.vue';
import MetaUpdateButton from 'src/components/header/MetaUpdateButton.vue';
import AccountButton from 'src/components/header/AccountButton.vue';
import NetworkButton from 'src/components/header/NetworkButton.vue';
// import ModalNetwork from 'src/components/balance/modals/ModalNetwork.vue';

interface Modal {
  modalNetwork: boolean;
}

export default defineComponent({
  components: {
    ConnectButton,
    MetaUpdateButton,
    AccountButton,
    NetworkButton,
    // ModalNetwork,
  },
  setup() {
    const { isOpen } = useSidebar();
    const stateModal = reactive<Modal>({
      modalNetwork: false,
    });
    const store = useStore();

    return {
      isOpen,
      ...toRefs(stateModal),
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
