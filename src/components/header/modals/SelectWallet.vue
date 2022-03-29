<template>
  <div class="wrapper--select-account">
    <div class="row--input">
      <div class="box__row--wallet" @click="openOption = !openOption">
        <div class="wrapper--row--wallet">
          <img width="24" :src="selWalletIcon" />
          <div class="txt--wallet-name">{{ selWalletIdx }}</div>
        </div>
        <template v-if="!openOption">
          <div class="txt--change">{{ $t('change') }}</div>
        </template>
        <template v-else>
          <div></div>
        </template>
      </div>
    </div>
    <div v-if="openOption" class="box--wallet-option">
      <ul class="container--wallet">
        <SelectWalletOption
          v-for="(wallet, index) in wallets"
          :key="index"
          v-model:selOption="selWalletIdx"
          :icon-wallet="wallet.img"
          :wallet-name="wallet.name"
          :checked="selWalletIdx === wallet.name"
        />
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import {
  Wallet,
  supportEvmWallets,
  supportWallets,
  supportWalletObj,
  SupportWallet,
} from 'src/config/wallets';
import SelectWalletOption from './SelectWalletOption.vue';
import { isMobileDevice } from 'src/hooks/helper/wallet';

export default defineComponent({
  components: {
    SelectWalletOption,
    // IconBase,
  },
  props: {
    isEvmOnly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ['update:sel-address', 'sel-changed'],
  setup(props, { emit }) {
    const openOption = ref<boolean>(false);
    const selWalletIcon = ref(supportWalletObj[SupportWallet.PolkadotJs].img);
    const selWalletIdx = ref<string>(supportWalletObj[SupportWallet.PolkadotJs].name);

    const closeOption = () => {
      setTimeout(() => {
        openOption.value = false;
      }, 400);
    };

    const wallets = ref<Wallet[]>(supportWallets);
    watchEffect(() => {
      wallets.value = props.isEvmOnly
        ? supportEvmWallets
        : (supportWallets
            .map((it) => {
              const { isSupportMobileApp, isSupportBrowserExtension } = it;
              if (isMobileDevice) {
                return isSupportMobileApp ? it : null;
              } else {
                return isSupportBrowserExtension ? it : null;
              }
            })
            .filter((it) => it !== null) as Wallet[]);
    });

    watch(
      [selWalletIdx],
      () => {
        const wallet = wallets.value.find((it: Wallet) => it.name === selWalletIdx.value);
        if (!wallet) return;
        // selAddress.value = account.address;
        // emit('update:sel-address', selAddress.value);
        selWalletIcon.value = wallet.img;
        emit('sel-changed', selWalletIdx.value);
        openOption.value = false;
      },
      { immediate: true }
    );

    return {
      openOption,
      closeOption,
      wallets,
      selWalletIdx,
      selWalletIcon,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.box__row--wallet {
  display: flex;
  justify-content: space-between;
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

  .wrapper--row--wallet {
    display: flex;
    align-items: center;

    .txt--wallet-name {
      margin-left: 8px;
    }
  }

  .txt--change {
    color: $astar-blue-dark;
    margin-right: 8px;
  }
}

.box--wallet-option {
  position: absolute;
  width: 19.688rem;
  margin-left: 20px;
  margin-top: 4px;
  border-radius: 6px;
  z-index: 10;
  top: 150px;
  background: $container-bg-white;
}

.container--wallet {
  max-height: 228px;
  border-radius: 6px;
  padding-top: 4px;
  overflow: auto;
  width: 19.688rem;
  &:focus {
    outline: none;
  }
}

.body--dark {
  .box--wallet-option {
    background: $gray-6;
  }
  .box__row--wallet {
    background: $gray-6;
    color: $gray-1;
  }
}
</style>
