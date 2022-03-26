<template>
  <div>
    <astar-header :title="headerName">
      <template v-if="!currentAccount">
        <ConnectButton @click="openSelectModal" />
      </template>
      <template v-else>
        <AccountButton :account="currentAccount" @click="disconnectAccount" />
      </template>
      <NetworkButton @show-network="modalNetwork = true" />
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
import { defineComponent, reactive, toRefs, computed, ref, watch } from 'vue';
import { useConnectWallet } from 'src/hooks';
import { useStore } from 'src/store';
import { useRoute } from 'vue-router';
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
    const route = useRoute();
    const path = computed(() => route.path.split('/')[1]);
    const headerName = ref('');
    watch(
      path,
      () => {
        if (path.value === 'dashboard') {
          headerName.value = 'Dashboard';
        } else if (path.value === 'assets') {
          headerName.value = 'Assets';
        } else if (path.value === 'dapp-staking') {
          headerName.value = 'Staking';
        } else if (path.value === 'bridge') {
          headerName.value = 'Bridge';
        }
      },
      {
        immediate: true,
      }
    );

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
