<template>
  <div class="wrapper">
    <header-comp :title="width >= screenSize.lg ? headerName : ''" :network="currentNetworkIdx">
      <template #left>
        <div class="icon"><logo /></div>
      </template>
      <div v-if="path.includes('snap')" />
      <div v-else-if="!currentAccount">
        <connect-button :class="isLoading && 'cursor--disabled'" @click="openSelectModal">
          <astar-icon-wallet />
        </connect-button>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('wallet.connectWallet') }}</span>
        </q-tooltip>
      </div>
      <template v-else>
        <account-button
          :account="currentAccount"
          :class="isLoading && 'cursor--disabled'"
          @click="clickAccountBtn"
        />
      </template>
      <network-button v-if="!path.includes('snap')" @show-network="clickNetworkBtn" />
      <trouble-help />
      <mobile-nav v-if="width <= screenSize.lg" />
    </header-comp>

    <!-- Modals -->
    <modal-network
      v-if="modalNetwork"
      v-model:isOpen="modalNetwork"
      v-model:selectNetwork="currentNetworkIdx"
      :network-idx="currentNetworkIdx"
    />

    <modal-connect-wallet
      v-if="!path.includes('snap')"
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
      :open-account-unification-modal="openAccountUnificationModal"
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
    <modal-account-unification
      v-if="modalAccountUnificationSelect"
      v-model:isOpen="modalAccountUnificationSelect"
      :open-select-modal="openSelectModal"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  ref,
  watch,
  onMounted,
  onUnmounted,
} from 'vue';
import { useAccount, useConnectWallet, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { useRoute } from 'vue-router';
import { getHeaderName } from 'src/router/routes';
import { useBreakpoints } from 'src/hooks';
import TroubleHelp from 'src/components/header/TroubleHelp.vue';
import ConnectButton from 'src/components/header/ConnectButton.vue';
import AccountButton from 'src/components/header/AccountButton.vue';
import NetworkButton from 'src/components/header/NetworkButton.vue';
import MobileNav from 'src/components/header/mobile/MobileNav.vue';
import ModalConnectWallet from 'src/components/header/modals/ModalConnectWallet.vue';
import ModalAccount from 'src/components/header/modals/ModalAccount.vue';
import ModalPolkasafe from 'src/components/header/modals/ModalPolkasafe.vue';
import ModalAccountUnification from 'src/components/header/modals/ModalAccountUnification.vue';
import ModalNetwork from 'src/components/header/modals/ModalNetwork.vue';
import Logo from 'src/components/common/Logo.vue';
import HeaderComp from './HeaderComp.vue';
import { WalletModalOption } from 'src/config/wallets';
import { container } from 'src/v2/common';
import { IEventAggregator, UnifyAccountMessage } from 'src/v2/messaging';
import { Symbols } from 'src/v2/symbols';
import { isValidAddressPolkadotAddress } from '@astar-network/astar-sdk-core';

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
    ModalPolkasafe,
    ModalAccountUnification,
    MobileNav,
  },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const { multisig } = useAccount();

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
      modalAccountUnificationSelect,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      changeAccount,
      connectEthereumWallet,
      disconnectAccount,
      openPolkasafeModal,
      openAccountUnificationModal,
    } = useConnectWallet();

    const { isZkEvm } = useNetworkInfo();

    const clickAccountBtn = (): void => {
      if (multisig.value) {
        openPolkasafeModal();
      } else {
        if (modalName.value === WalletModalOption.SelectWallet) {
          return;
        }

        if (isH160.value) {
          modalName.value = WalletModalOption.SelectWallet;
        } else {
          changeAccount();
        }
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
    const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);

    onMounted(() => {
      eventAggregator.subscribe(UnifyAccountMessage.name, () => {
        modalAccountUnificationSelect.value = true;
      });
    });

    onUnmounted(() => {
      eventAggregator.unsubscribe(UnifyAccountMessage.name, () => {});
    });

    watch(
      path,
      () => {
        headerName.value = getHeaderName(path.value);
      },
      {
        immediate: true,
      }
    );

    // Watch for network change and open wallet modal if user connects to zkEVM, but has
    // Substrate wallet already connected.
    watch(
      [currentNetworkIdx, currentAccount],
      () => {
        if (
          currentNetworkIdx.value &&
          isZkEvm.value &&
          isValidAddressPolkadotAddress(currentAccount.value)
        ) {
          modalName.value = WalletModalOption.SelectWallet;
        }
      },
      { immediate: true }
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
      path,
      width,
      screenSize,
      isLoading,
      modalAccountUnificationSelect,
      clickAccountBtn,
      clickNetworkBtn,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      changeAccount,
      connectEthereumWallet,
      disconnectAccount,
      openPolkasafeModal,
      openAccountUnificationModal,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper {
  z-index: 100;
  @media (min-width: $lg) {
    border-left: solid 1px $navy-3;
    width: 100%;
    position: absolute;
    top: 0;
    left: 224px;
    padding-right: 224px;
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
