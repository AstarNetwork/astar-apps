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
      :set-polkadot="setPolkadot"
      :set-meta-mask="setMetaMask"
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
import { defineComponent } from 'vue';
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
      setPolkadot,
      setCloseModal,
      setMetaMask,
      openSelectModal,
    } = useConnectWallet();

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
      setPolkadot,
      setCloseModal,
      setMetaMask,
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
