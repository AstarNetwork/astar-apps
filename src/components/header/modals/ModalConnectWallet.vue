<template>
  <astar-modal-drawer :show="isModalConnectWallet" title="Select a Wallet" @close="setCloseModal()">
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
          :wallet="wallet"
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

    return {
      nativeWallets,
      evmWallets,
      isDappStakingPage,
      isClosing,
      castWalletName,
      closeModal,
      setSubstrateWalletModal,
      setEvmWalletModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.wrapper--modal--wallet {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 24px;
  padding-bottom: 20px;
}

.title--account-type {
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
  color: $navy-1;
  text-align: left;
  margin-left: 8px;
}

.box__row--wallet {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  height: rem(56);
  width: rem(314);
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $navy-1;
  margin: 0 auto;
  margin-top: 16px;
  padding: 16px;
  padding-left: 24px;
  cursor: pointer;

  &:hover {
    border: 1px solid $astar-blue;
  }

  &:active {
    border: 2px solid $astar-blue;
  }

  .box--img {
    width: 24px;
    height: 24px;
    margin-right: 13px;
  }
}

.body--dark {
  .title--account-type {
    color: $gray-1;
  }
  .box__row--wallet {
    background: $modal-item-bg-dark;
    color: $gray-1;
  }
}

@media screen and (max-width: $sm) {
  .title--account-type {
    margin-left: 46px;
  }
}
</style>
