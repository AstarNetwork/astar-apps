<template>
  <div>
    <!-- Memo: This is a temporary login solution until adding the dashboard page -->
    <div v-if="!currentAccount" class="container--connect-wallet">
      <button class="connect-wallet" :disabled="!isConnectedNetwork" @click="openSelectModal">
        {{ $t('wallet.connectWallet') }}
      </button>
    </div>
    <div v-else>
      <div class="container--assets">
        <Account
          :is-eth-wallet="isEthWallet"
          :is-h160="isH160"
          :toggle-meta-mask-schema="toggleMetaMaskSchema"
        />
      </div>
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
import Account from 'src/components/assets/Account.vue';
import ModalAccount from 'src/components/balance/modals/ModalAccount.vue';
import ModalConnectWallet from 'src/components/balance/modals/ModalConnectWallet.vue';
import ModalInstallWallet from 'src/components/balance/modals/ModalInstallWallet.vue';
import { useConnectWallet } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Account, ModalConnectWallet, ModalInstallWallet, ModalAccount },
  setup() {
    const {
      isConnectedNetwork,
      isEthWallet,
      isH160,
      currentAccount,
      selectedWallet,
      WalletModalOption,
      modalName,
      modalAccountSelect,
      openSelectModal,
      toggleMetaMaskSchema,
      setCloseModal,
      setWalletModal,
    } = useConnectWallet();

    return {
      isConnectedNetwork,
      isEthWallet,
      isH160,
      currentAccount,
      WalletModalOption,
      modalName,
      modalAccountSelect,
      selectedWallet,
      openSelectModal,
      toggleMetaMaskSchema,
      setCloseModal,
      setWalletModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
@use 'src/components/balance/styles/connect-wallet.scss';
</style>
