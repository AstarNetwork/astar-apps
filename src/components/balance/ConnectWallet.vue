<template>
  <div v-if="isConnected(currentNetworkStatus)" class="animate__animated animate__fadeIn">
    <div v-if="!currentAccount" class="container">
      <div class="connect-wallet" @click="openSelectModal">
        {{ $t('wallet.connectWallet') }}
      </div>
    </div>
    <div v-else>
      <BalancePlasm />
    </div>

    <modal-connect-wallet
      v-if="modalName === WalletOption.SelectWallet"
      :set-wallet-modal="setWalletModal"
      :set-close-modal="setCloseModal"
    />

    <ModalAccount
      v-if="modalAccountSelect"
      v-model:isOpen="modalAccountSelect"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
    />

    <ModalInstallWallet
      v-if="modalName === WalletOption.NoExtension"
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
import './styles/connect-wallet.scss';

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
      WalletOption,
      currentNetworkStatus,
      modalConnectWallet,
      currentAccount,
      modalName,
      allAccounts,
      allAccountNames,
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
      WalletOption,
      currentNetworkStatus,
      modalConnectWallet,
      currentAccount,
      modalName,
      allAccounts,
      allAccountNames,
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
