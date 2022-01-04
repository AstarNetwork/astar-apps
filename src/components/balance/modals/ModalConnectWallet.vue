<template>
  <Modal title="Select a Wallet" class="animate__animated animate__fadeIn" @click="setCloseModal">
    <template #content>
      <div class="tw-text-lg tw-text-center tw-text-blue-900 dark:tw-text-darkGray-100">
        {{ $t('wallet.select') }}
      </div>
      <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-x-8 tw-justify-center tw-items-center">
        <WalletOption v-for="(wallet, index) in wallets" :key="index" :wallet="wallet" />
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import WalletOption from 'src/components/balance/modals/wallet/WalletOption.vue';
import Modal from 'src/components/common/Modal.vue';
import { defineComponent, computed } from 'vue';
import '../styles/modal-connect-wallet.scss';
import { useRouter } from 'vue-router';

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
    const currentRoute = computed(() => {
      return useRouter().currentRoute.value;
    });

    const isBalancePath = currentRoute.value.matched[0].path === '/balance';

    const wallets = isBalancePath
      ? [
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
        ]
      : [
          {
            img: require('/src/assets/img/logo-polkadot-js.png'),
            name: 'wallet.polkadotJs',
            click: props.setPolkadot,
          },
        ];

    return { wallets };
  },
});
</script>
