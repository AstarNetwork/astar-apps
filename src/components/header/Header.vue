<template>
  <div>
    <astar-header :title="headerName">
      <template v-if="!currentAccount">
        <ConnectButton @click="openSelectModal" />
      </template>
      <template v-else>
        <AccountButton :account="currentAccount" @click="disconnectAccount" />
      </template>
      <NetworkButton network="Astar" @show-network="modalNetwork = true" />
    </astar-header>
    <!-- Modals -->
    <ModalNetwork
      v-if="modalNetwork"
      v-model:isOpen="modalNetwork"
      v-model:selectNetwork="currentNetworkIdx"
      :network-idx="currentNetworkIdx"
    />
    <ModalConnectWallet
      v-if="modalName === WalletModalOption.SelectWallet"
      :set-wallet-modal="setWalletModal"
      :set-close-modal="setCloseModal"
    />

    <ModalAccount
      v-if="modalAccountSelect"
      v-model:isOpen="modalAccountSelect"
      :selected-wallet="selectedWallet"
    />

    <ModalInstallWallet
      v-if="modalName === WalletModalOption.NoExtension"
      :set-close-modal="setCloseModal"
      :selected-wallet="selectedWallet"
    />
    <!-- <astar-simple-modal title="Network" :show="true" @close="modalNetwork = false"
      >Test</astar-simple-modal
    > -->
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'vue';
import { useConnectWallet } from 'src/hooks';
import { useStore } from 'src/store';
import ConnectButton from 'src/components/header/ConnectButton.vue';
import AccountButton from 'src/components/header/AccountButton.vue';
import NetworkButton from 'src/components/header/NetworkButton.vue';
import ModalAccount from 'src/components/balance/modals/ModalAccount.vue';
import ModalConnectWallet from 'src/components/balance/modals/ModalConnectWallet.vue';
import ModalInstallWallet from 'src/components/balance/modals/ModalInstallWallet.vue';
import ModalNetwork from 'src/components/balance/modals/ModalNetwork.vue';

interface Modal {
  modalNetwork: boolean;
}

export default defineComponent({
  components: {
    ConnectButton,
    AccountButton,
    NetworkButton,
    ModalAccount,
    ModalConnectWallet,
    ModalInstallWallet,
    ModalNetwork,
  },
  setup() {
    const stateModal = reactive<Modal>({
      modalNetwork: false,
    });

    const {
      WalletModalOption,
      modalConnectWallet,
      modalName,
      currentAccount,
      currentAccountName,
      selectedWallet,
      modalAccountSelect,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      disconnectAccount,
    } = useConnectWallet();

    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const headerName = computed(() => store.getters['general/headerName']);

    return {
      ...toRefs(stateModal),
      headerName,
      currentNetworkIdx,
      WalletModalOption,
      modalConnectWallet,
      currentAccount,
      modalName,
      currentAccountName,
      selectedWallet,
      modalAccountSelect,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      disconnectAccount,
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
