<template>
  <div class="wrapper">
    <header-comp :title="width >= screenSize.lg ? headerName : ''" :network="currentNetworkIdx">
      <template #left>
        <div class="icon"><logo /></div>
      </template>
      <div v-if="!currentAccount">
        <connect-button @click="clickAccountBtn">
          <astar-icon-wallet />
        </connect-button>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('wallet.connectWallet') }}</span>
        </q-tooltip>
      </div>
      <template v-else>
        <account-button :account="currentAccount" @click="clickAccountBtn" />
      </template>
      <network-button @show-network="clickNetworkBtn" />
      <trouble-help />
      <mobile-nav v-if="width <= screenSize.lg" />
    </header-comp>

    <!-- Modals -->
    <modal-network-wallet
      v-if="isModalNetworkWallet"
      v-model:isOpen="isModalNetworkWallet"
      :network-idx="currentNetworkIdx"
      :is-select-wallet="isSelectWallet"
      :modal-name="modalName"
      :selected-wallet="selectedWallet"
      :modal-account-select="modalAccountSelect"
      :modal-polkasafe-select="modalPolkasafeSelect"
      :set-wallet-modal="setWalletModal"
      :connect-ethereum-wallet="connectEthereumWallet"
      :open-polkasafe-modal="openPolkasafeModal"
      :set-modal-account-select="setModalAccountSelect"
      :set-modal-polkasafe-select="setModalPolkasafeSelect"
      :set-is-select-wallet="setIsSelectWallet"
    />

    <modal-account-unification
      v-if="modalAccountUnificationSelect"
      v-model:isOpen="modalAccountUnificationSelect"
      :open-select-modal="openSelectModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted, onUnmounted, watchEffect } from 'vue';
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
import ModalAccountUnification from 'src/components/header/modals/ModalAccountUnification.vue';
import ModalNetworkWallet from 'src/components/header/modals/ModalNetworkWallet.vue';
import Logo from 'src/components/common/Logo.vue';
import HeaderComp from './HeaderComp.vue';
import { SupportWallet, WalletModalOption } from 'src/config/wallets';
import { container } from 'src/v2/common';
import { IEventAggregator, UnifyAccountMessage } from 'src/v2/messaging';
import { Symbols } from 'src/v2/symbols';
import { isValidAddressPolkadotAddress } from '@astar-network/astar-sdk-core';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  components: {
    ConnectButton,
    AccountButton,
    NetworkButton,
    ModalNetworkWallet,
    Logo,
    HeaderComp,
    TroubleHelp,
    ModalAccountUnification,
    MobileNav,
  },
  setup() {
    const { width, screenSize } = useBreakpoints();

    const { currentAccount, disconnectAccount } = useAccount();
    const { currentNetworkName } = useNetworkInfo();
    const isModalNetworkWallet = ref<boolean>(false);
    const isSelectWallet = ref<boolean>(false);

    const setIsSelectWallet = (result: boolean): void => {
      isSelectWallet.value = result;
    };

    const {
      modalName,
      modalAccountSelect,
      modalPolkasafeSelect,
      modalAccountUnificationSelect,
      selectedWallet,
      openSelectModal,
      setWalletModal,
      connectEthereumWallet,
      openPolkasafeModal,
      setModalAccountSelect,
      setModalPolkasafeSelect,
    } = useConnectWallet();

    const { isZkEvm } = useNetworkInfo();

    const clickAccountBtn = (): void => {
      isModalNetworkWallet.value = true;
      isSelectWallet.value = true;
    };

    const clickNetworkBtn = (): void => {
      isModalNetworkWallet.value = true;
      isSelectWallet.value = false;
      modalName.value = '';
      modalAccountSelect.value = false;
      modalPolkasafeSelect.value = false;
    };

    // Memo: open the network modal if there is no wallet address stored in the browser
    const initIsModalNetworkWallet = () => {
      const selectedAddress = String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS));
      const wallet = localStorage.getItem(LOCAL_STORAGE.SELECTED_WALLET);
      const isWalletConnect = wallet === SupportWallet.WalletConnect;
      if (!currentNetworkName.value || selectedAddress !== 'null' || isWalletConnect) {
        return;
      }
      isModalNetworkWallet.value = true;
    };

    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
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

    watch([currentNetworkName], initIsModalNetworkWallet, { immediate: true });

    return {
      isModalNetworkWallet,
      headerName,
      currentNetworkIdx,
      WalletModalOption,
      currentAccount,
      modalAccountSelect,
      modalPolkasafeSelect,
      width,
      screenSize,
      isLoading,
      modalAccountUnificationSelect,
      isSelectWallet,
      modalName,
      selectedWallet,
      clickAccountBtn,
      clickNetworkBtn,
      openSelectModal,
      disconnectAccount,
      setWalletModal,
      connectEthereumWallet,
      openPolkasafeModal,
      setModalAccountSelect,
      setModalPolkasafeSelect,
      setIsSelectWallet,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper {
  z-index: 100;
  position: sticky;
  top: 0;
  @media (min-width: $lg) {
    position: relative;
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
