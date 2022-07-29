<template>
  <div class="wrapper">
    <astar-header
      :title="width >= screenSize.lg ? headerName : ''"
      :class="screenSize.lg > width && 'm-header'"
    >
      <template #left>
        <div class="icon"><Logo /></div>
      </template>
      <template v-if="!currentAccount">
        <ConnectButton @click="openSelectModal">
          <astar-icon-wallet />
        </ConnectButton>
      </template>
      <template v-else>
        <AccountButton :account="currentAccount" @click="changeAccount" />
      </template>
      <NetworkButton @show-network="modalNetwork = true" />
    </astar-header>

    <!-- Modals -->
    <ModalNetwork
      v-model:isOpen="modalNetwork"
      v-model:selectNetwork="currentNetworkIdx"
      :network-idx="currentNetworkIdx"
    />
    <ModalConnectWallet
      :is-modal-connect-wallet="modalName === WalletModalOption.SelectWallet"
      :set-wallet-modal="setWalletModal"
      :set-close-modal="setCloseModal"
      :connect-ethereum-wallet="connectEthereumWallet"
    />

    <ModalAccount
      v-if="modalAccountSelect"
      v-model:isOpen="modalAccountSelect"
      :set-wallet-modal="setWalletModal"
      :selected-wallet="selectedWallet"
      :connect-ethereum-wallet="connectEthereumWallet"
      :disconnect-account="disconnectAccount"
      :current-account="currentAccount"
    />

    <ModalInstallWallet
      v-if="modalName === WalletModalOption.NoExtension"
      :set-close-modal="setCloseModal"
      :selected-wallet="selectedWallet"
    />

    <ModalUpdateWallet
      v-if="modalName === WalletModalOption.OutdatedWallet"
      :set-close-modal="setCloseModal"
      :selected-wallet="selectedWallet"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, ref, watch } from 'vue';
import { useConnectWallet } from 'src/hooks';
import { useStore } from 'src/store';
import { useRoute } from 'vue-router';
import { getHeaderName } from 'src/router/routes';
import { useBreakpoints } from 'src/hooks';
import ConnectButton from 'src/components/header/ConnectButton.vue';
import AccountButton from 'src/components/header/AccountButton.vue';
import NetworkButton from 'src/components/header/NetworkButton.vue';
import ModalConnectWallet from 'src/components/header/modals/ModalConnectWallet.vue';
import ModalAccount from 'src/components/header/modals/ModalAccount.vue';
import ModalInstallWallet from 'src/components/header/modals/ModalInstallWallet.vue';
import ModalNetwork from 'src/components/header/modals/ModalNetwork.vue';
import Logo from 'src/components/common/Logo.vue';
import ModalUpdateWallet from './modals/ModalUpdateWallet.vue';

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
    Logo,
    ModalUpdateWallet,
  },
  setup() {
    const { width, screenSize } = useBreakpoints();

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
      changeAccount,
      connectEthereumWallet,
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
        headerName.value = getHeaderName(path.value);
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
      width,
      screenSize,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      changeAccount,
      connectEthereumWallet,
      disconnectAccount,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper {
  z-index: 100;
}
.icon {
  width: 127px;
  margin-left: -15px;
}

.m-header {
  background: #fff !important;
  height: 64px !important;
  padding-left: 20px !important;
  padding-right: 16px !important;
  @media (min-width: 500px) {
    padding-left: 8px !important;
  }
}

.body--dark {
  .m-header {
    background: $gray-6 !important;
  }
}
</style>
