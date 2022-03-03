<template>
  <div v-if="isConnected(currentNetworkStatus)">
    <div v-if="!currentAccount" class="container">
      <div class="connect-wallet" @click="openSelectModal">
        {{ $t('wallet.connectWallet') }}
      </div>
    </div>
    <div v-else>
      <BalancePlasm />
    </div>

    <modal-connect-wallet
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
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import BalancePlasm from 'src/components/balance/BalancePlasm.vue';
import { useConnectWallet } from 'src/hooks';
import { defineComponent, watch } from 'vue';
import ModalAccount from './modals/ModalAccount.vue';
import ModalConnectWallet from './modals/ModalConnectWallet.vue';
import ModalInstallWallet from './modals/ModalInstallWallet.vue';

export default defineComponent({
  components: {
    ModalConnectWallet,
    BalancePlasm,
    ModalInstallWallet,
    ModalAccount,
  },
  setup() {
    useMeta({ title: 'Wallet' });

    const {
      WalletModalOption,
      currentNetworkStatus,
      modalConnectWallet,
      currentAccount,
      modalName,
      selectedWallet,
      modalAccountSelect,
      setCloseModal,
      setWalletModal,
      openSelectModal,
    } = useConnectWallet();

    watch(
      [currentAccount],
      () => {
        if (currentAccount.value === '') {
          setTimeout(() => {
            openSelectModal();
          }, 200);
        }
      },
      { immediate: false }
    );

    return {
      WalletModalOption,
      currentNetworkStatus,
      modalConnectWallet,
      currentAccount,
      modalName,
      selectedWallet,
      modalAccountSelect,
      setCloseModal,
      setWalletModal,
      openSelectModal,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
  },
});
</script>

<style lang="scss" scoped>
@import './styles/connect-wallet.scss';
</style>
