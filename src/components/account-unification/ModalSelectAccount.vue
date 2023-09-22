<template>
  <modal-wrapper
    :is-modal-open="isModalOpened"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <wallets-panel
      :wallets="nativeWallets"
      :current-wallet="currentWallet"
      :set-wallet-modal="() => {}"
    />
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { Wallet, supportWallets } from 'src/config/wallets';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import WalletsPanel from 'src/components/common/WalletsPanel.vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    ModalWrapper,
    WalletsPanel,
  },
  props: {
    isModalOpened: {
      type: Boolean,
      required: true,
    },
    handleModalSelectAccount: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const currentWallet = computed<string>(() => store.getters['general/currentWallet']);
    const isClosingModal = ref<boolean>(false);

    const closeModal = async (): Promise<void> => {
      props.handleModalSelectAccount({ isOpen: false });
    };

    const nativeWallets = computed(() => {
      return supportWallets
        .map((it) => {
          const { isSupportMobileApp, isSupportBrowserExtension } = it;
          if (isMobileDevice) {
            return isSupportMobileApp ? it : undefined;
          } else {
            return isSupportBrowserExtension ? it : undefined;
          }
        })
        .filter((it) => it !== undefined) as Wallet[];
    });

    return { isClosingModal, closeModal, nativeWallets, currentWallet };
  },
});
</script>

<style lang="scss" scoped>
</style>
