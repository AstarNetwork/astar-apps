<template>
  <astar-simple-modal :show="isModalConnectWallet" title="Select a Wallet" @close="setCloseModal">
    <div class="wrapper--modal">
      <div class="title--account-type">Native Account</div>
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

      <div class="title--account-type">EVM Account</div>
      <div
        v-for="(wallet, index) in evmWallets"
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
    </div>
  </astar-simple-modal>
</template>
 <script lang="ts">
import { defineComponent, watchEffect, ref } from 'vue';
import { Wallet, supportNativeAccountWallets, supportEvmAccountWallets } from 'src/config/wallets';
import { isMobileDevice } from 'src/hooks/helper/wallet';

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
  setup(props) {
    const nativeWallets = ref<Wallet[]>(supportNativeAccountWallets);
    watchEffect(() => {
      nativeWallets.value = supportNativeAccountWallets
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

    const evmWallets = ref<Wallet[]>(supportEvmAccountWallets);
    watchEffect(() => {
      evmWallets.value = supportEvmAccountWallets
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
}

.title--account-type {
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: $gray-1;
  text-align: left;
  margin-left: 21px;
  margin-top: 24px;
}

.box__row--wallet {
  display: flex;
  align-items: center;
  background: $gray-6;
  border-radius: 6px;
  height: 3.5rem;
  width: 19.688rem;
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $gray-1;
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
  .box--withdraw-amount {
    background: $gray-6;
  }
}
</style>