<template>
  <Modal title="Select a Wallet" class="animate__animated animate__fadeIn" @click="setCloseModal">
    <template #content>
      <div class="tw-max-w-md">
        <div class="tw-text-lg tw-text-center tw-text-blue-900 dark:tw-text-darkGray-100">
          {{ $t('wallet.select') }}
        </div>
        <div
          class="
            tw-flex tw-flex-col
            sm:tw-flex-row sm:tw-flex-wrap
            tw-gap-x-2 tw-justify-center tw-items-center
          "
        >
          <WalletOption
            v-for="(wallet, index) in wallets"
            :key="index"
            :wallet="wallet"
            :set-wallet-modal="setWalletModal"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import WalletOption from 'src/components/balance/modals/wallet/WalletOption.vue';
import Modal from 'src/components/common/Modal.vue';
import { supportWallets, Wallet } from 'src/config/wallets';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { defineComponent, watchEffect, ref } from 'vue';

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
    const wallets = ref<Wallet[]>(supportWallets);
    watchEffect(() => {
      wallets.value = supportWallets
        .map((it) => {
          const { isSupportMobileApp, isSupportBrowserExtension } = it;
          if (isMobileDevice) {
            return isSupportMobileApp ? it : null;
          } else {
            return isSupportBrowserExtension ? it : null;
          }
        })
        .filter((it) => it !== null) as Wallet[];
    });
    return { wallets };
  },
});
</script>
