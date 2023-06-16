<template>
  <div class="wrapper">
    <header-comp :title="width >= screenSize.lg ? headerName : ''">
      <template #left>
        <div class="icon"><logo /></div>
      </template>
      <trouble-help />
      <multisig-configure />
      <template v-if="!currentAccount">
        <connect-button :class="isLoading && 'cursor--disabled'" @click="openSelectModal">
          <astar-icon-wallet />
        </connect-button>
      </template>
      <template v-else>
        <account-button
          :account="currentAccount"
          :class="isLoading && 'cursor--disabled'"
          @click="clickAccountBtn"
        />
      </template>
      <network-button @show-network="clickNetworkBtn" />
    </header-comp>

    <!-- Modals -->
    <modal-network
      v-if="modalNetwork"
      v-model:isOpen="modalNetwork"
      v-model:selectNetwork="currentNetworkIdx"
      :network-idx="currentNetworkIdx"
    />

    <modal-connect-wallet
      :is-modal-connect-wallet="
        modalName === WalletModalOption.SelectWallet ||
        modalName === WalletModalOption.NoExtension ||
        modalName === WalletModalOption.OutdatedWallet
      "
      :is-no-extension="
        modalName === WalletModalOption.NoExtension ||
        modalName === WalletModalOption.OutdatedWallet
      "
      :set-wallet-modal="setWalletModal"
      :set-close-modal="setCloseModal"
      :connect-ethereum-wallet="connectEthereumWallet"
      :selected-wallet="selectedWallet"
      :open-polkasafe-modal="openPolkasafeModal"
    />

    <modal-account
      v-if="modalAccountSelect"
      v-model:isOpen="modalAccountSelect"
      :open-select-modal="openSelectModal"
      :selected-wallet="selectedWallet"
      :connect-ethereum-wallet="connectEthereumWallet"
      :disconnect-account="disconnectAccount"
      :current-account="currentAccount"
    />
    <modal-polkasafe
      v-if="modalPolkasafeSelect"
      v-model:isOpen="modalPolkasafeSelect"
      :open-select-modal="openSelectModal"
      :selected-wallet="selectedWallet"
      :disconnect-account="disconnectAccount"
      :current-account="currentAccount"
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
import TroubleHelp from 'src/components/header/TroubleHelp.vue';
import MultisigConfigure from 'src/components/header/MultisigConfigure.vue';
import ConnectButton from 'src/components/header/ConnectButton.vue';
import AccountButton from 'src/components/header/AccountButton.vue';
import NetworkButton from 'src/components/header/NetworkButton.vue';
import ModalConnectWallet from 'src/components/header/modals/ModalConnectWallet.vue';
import ModalAccount from 'src/components/header/modals/ModalAccount.vue';
import ModalPolkasafe from 'src/components/header/modals/ModalPolkasafe.vue';
import ModalNetwork from 'src/components/header/modals/ModalNetwork.vue';
import Logo from 'src/components/common/Logo.vue';
import HeaderComp from './HeaderComp.vue';
import { WalletModalOption } from 'src/config/wallets';

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
    ModalNetwork,
    Logo,
    HeaderComp,
    TroubleHelp,
    MultisigConfigure,
    ModalPolkasafe,
  },
  setup() {
    const { width, screenSize } = useBreakpoints();

    const stateModal = reactive<Modal>({
      modalNetwork: false,
    });

    const {
      modalConnectWallet,
      modalName,
      currentAccount,
      currentAccountName,
      selectedWallet,
      modalAccountSelect,
      modalPolkasafeSelect,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      changeAccount,
      connectEthereumWallet,
      disconnectAccount,
      openPolkasafeModal,
    } = useConnectWallet();

    const clickAccountBtn = () => {
      if (modalName.value === WalletModalOption.SelectWallet) {
        return;
      }

      if (isH160.value) {
        modalName.value = WalletModalOption.SelectWallet;
      } else {
        changeAccount();
      }
      stateModal.modalNetwork = false;
    };

    const clickNetworkBtn = (): void => {
      stateModal.modalNetwork = true;
      modalName.value = '';
      modalAccountSelect.value = false;
      modalPolkasafeSelect.value = false;
    };

    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const currentNetworkIdx = computed<number>(() => store.getters['general/networkIdx']);
    const route = useRoute();
    const path = computed<string>(() => route.path);
    const headerName = ref<string>('');

    watch(
      path,
      async () => {
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
      modalPolkasafeSelect,
      width,
      screenSize,
      isLoading,
      clickAccountBtn,
      clickNetworkBtn,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      changeAccount,
      connectEthereumWallet,
      disconnectAccount,
      openPolkasafeModal,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper {
  z-index: 100;
  background-color: $navy-2;
  @media (min-width: $lg) {
    width: 100%;
    position: absolute;
    top: 0;
    left: 224px;
    padding-right: 224px;
    background-color: transparent;
  }
}

.icon {
  width: 127px;
  margin-left: -15px;
}

.cursor--disabled {
  cursor: not-allowed !important;
}
</style>
