<template>
  <astar-simple-modal :show="isModalConnectWallet" title="Select a Wallet" @close="setCloseModal">
    <div class="wrapper--modal">
      <div class="title--account-type">{{ $t('wallet.nativeAccount') }}</div>
      <div
        v-for="(wallet, index) in nativeWallets"
        :key="index"
        class="box__row--wallet"
        :wallet="wallet"
        @click="setWalletModal(wallet.source)"
      >
        <div class="box--img">
          <img width="40" :src="wallet.img" />
        </div>
        <div>{{ wallet.name }}</div>
      </div>

      <div class="title--account-type tw-mt-4">{{ $t('wallet.evmAccount') }}</div>
      <div
        v-for="(wallet, index) in evmWallets"
        :key="index"
        class="box__row--wallet box--hover--active"
        :wallet="wallet"
        @click="setWalletModal(wallet.source)"
      >
        <div class="box--img">
          <img width="40" :src="wallet.img" />
        </div>
        <div>{{ wallet.name }}</div>
      </div>
    </div>
  </astar-simple-modal>
</template>
<script lang="ts">
import { supportEvmWallets, supportWallets, Wallet } from 'src/config/wallets';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { computed, defineComponent } from 'vue';

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
    isEvmOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
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

    return {
      nativeWallets,
      evmWallets,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--modal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 32px;
  padding-bottom: 40px;
}

.title--account-type {
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: $gray-5;
  text-align: left;
  margin-left: 21px;
}

.box__row--wallet {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  height: 3.5rem;
  width: 19.688rem;
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $gray-5;
  margin: 0 auto;
  margin-top: 16px;
  padding: 16px;
  cursor: pointer;

  &:hover {
    border: 1px solid $astar-blue-dark;
  }

  &:active {
    border: 2px solid $astar-blue-dark;
  }

  .box--img {
    width: 40px;
    height: 40px;
    margin-right: 13px;
  }
}

.body--dark {
  .title--account-type {
    color: $gray-1;
  }
  .box__row--wallet {
    background: $gray-6;
    color: $gray-1;
  }
}
</style>
