<template>
  <Modal title="Select a Wallet" class="animate__animated animate__fadeIn" @click="setCloseModal">
    <template #content>
      <div class="tw-text-lg tw-text-center tw-text-blue-900 dark:tw-text-darkGray-100">
        {{ $t('wallet.select') }}
      </div>
      <div class="tw-grid sm:tw-grid-cols-2 tw-justify-center tw-gap-x-4">
        <WalletOption
          v-for="(wallet, index) in supportWallets"
          :key="index"
          :wallet="wallet"
          :set-wallet-modal="setWalletModal"
        />
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import WalletOption from 'src/components/balance/modals/wallet/WalletOption.vue';
import Modal from 'src/components/common/Modal.vue';
import { supportWallets } from 'src/config/wallets';
import { defineComponent } from 'vue';
import '../styles/modal-connect-wallet.scss';

export default defineComponent({
  components: {
    Modal,
    WalletOption,
  },
  props: {
    setCloseModal: {
      type: Function,
      required: true,
    },
    setWalletModal: {
      type: Function,
      required: true,
    },
  },
  setup() {
    return { supportWallets };
  },
});
</script>
