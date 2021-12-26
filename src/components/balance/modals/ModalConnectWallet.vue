<template>
  <Modal title="Select a Wallet" @click="setCloseModal">
    <template #content>
      <div class="tw-text-lg tw-text-blue-900 dark:tw-text-darkGray-100">
        {{ $t('wallet.select') }}
      </div>
      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-x-8">
        <WalletOption v-for="(wallet, index) in wallets" :key="index" :wallet="wallet" />
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import WalletOption from 'src/components/balance/modals/wallet/WalletOption.vue';
import Modal from 'src/components/common/Modal.vue';
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
    setPolkadot: {
      type: Function,
      required: true,
    },
    setMetaMask: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const wallets = [
      {
        img: require('/src/assets/img/logo-polkadot-js.png'),
        name: 'wallet.polkadotJs',
        click: props.setPolkadot,
      },
      {
        img: require('/src/assets/img/metamask.png'),
        name: 'wallet.metamask',
        click: props.setMetaMask,
      },
    ];

    return { wallets };
  },
});
</script>
