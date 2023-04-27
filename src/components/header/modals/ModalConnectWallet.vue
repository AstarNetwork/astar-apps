<template>
  <astar-modal-drawer
    :show="isModalConnectWallet"
    :is-closing="isClosing"
    title="Select a Wallet"
    @close="closeModal()"
  >
    <div class="wrapper--modal--wallet">
      <div v-if="!isDappStakingPage">
        <div class="title--account-type">
          <span>
            {{ $t('wallet.evmAccount') }}
          </span>
        </div>
        <div class="wrapper--wallets">
          <div
            v-for="(wallet, index) in evmWallets"
            :key="index"
            class="box__row--wallet box--hover--active"
            :class="currentWallet == wallet.source && 'border--active'"
            :wallet="wallet"
            @click="setEvmWalletModal(wallet.source)"
          >
            <div class="box--img">
              <img :src="wallet.img" />
            </div>
            <div>
              <span>
                {{ castWalletName(wallet.name) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="title--account-type tw-mt-4">
        <span>
          {{ $t('wallet.nativeAccount') }}
        </span>
      </div>
      <div class="wrapper--wallets">
        <div
          v-for="(wallet, index) in nativeWallets"
          :key="index"
          class="box__row--wallet box--hover--active"
          :class="currentWallet == wallet.source && 'border--active'"
          @click="setSubstrateWalletModal(wallet.source)"
        >
          <div class="box--img">
            <img :src="wallet.img" />
          </div>
          <div>
            <span>
              {{ castWalletName(wallet.name) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { supportEvmWallets, supportWallets, Wallet } from 'src/config/wallets';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
export default defineComponent({
  props: {
    isModalConnectWallet: {
      type: Boolean,
      required: true,
    },
    setCloseModal: {
      type: Function,
      required: true,
    },
    setWalletModal: {
      type: Function,
      required: true,
    },
    connectEthereumWallet: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const store = useStore();
    const isClosing = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      props.setCloseModal();
    };
    const isDappStakingPage = computed<boolean>(() => route.fullPath.includes('dapp-staking'));
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

    const evmWallets = computed(() => {
      return supportEvmWallets
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

    const castWalletName = (wallet: string): string => {
      return wallet.split('(')[0].trim();
    };

    const setSubstrateWalletModal = async (source: string): Promise<void> => {
      await closeModal();
      props.setWalletModal(source);
    };

    const setEvmWalletModal = async (source: string): Promise<void> => {
      await closeModal();
      props.connectEthereumWallet(source);
    };
    const currentWallet = computed<string>(() => store.getters['general/currentWallet']);

    return {
      nativeWallets,
      evmWallets,
      isDappStakingPage,
      isClosing,
      currentWallet,
      castWalletName,
      closeModal,
      setSubstrateWalletModal,
      setEvmWalletModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-connect-wallet.scss';
</style>
