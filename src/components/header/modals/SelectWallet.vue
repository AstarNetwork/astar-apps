<template>
  <div class="wrapper--select-account">
    <div class="row--input">
      <div class="box__row--wallet" @click="openOption = !openOption">
        <div class="wrapper--row--wallet">
          <img v-if="selWallet.img" width="24" :src="selWallet.img" />
          <div class="txt--wallet-name">{{ selWallet.name }}</div>
        </div>
        <div class="txt--change">
          <span v-if="!openOption">
            {{ $t('change') }}
          </span>
        </div>
      </div>
      <div v-if="openOption" v-click-away="closeOption" class="box--wallet-option">
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
  </div>
</template>
<script lang="ts">
import { supportAllWallets, supportAllWalletsObj, SupportWallet, Wallet } from 'src/config/wallets';
import { isMobileDevice } from 'src/hooks/helper/wallet';
import { computed, defineComponent, PropType, ref, watch, watchEffect } from 'vue';
import SelectWalletOption from 'src/components/header/modals/SelectWalletOption.vue';

export default defineComponent({
  components: {
    SelectWalletOption,
  },
  props: {
    setWalletModal: {
      type: Function,
      required: true,
    },
    selectedWallet: {
      type: String as PropType<SupportWallet>,
      required: true,
    },
  },
  emits: ['sel-changed'],
  setup(props, { emit }) {
    const openOption = ref<boolean>(false);
    const selWalletIcon = ref<string>('');
    const selWalletIdx = ref<string>('');
    const selWallet = computed(() => supportAllWalletsObj[props.selectedWallet]);

    const closeOption = () => {
      openOption.value = false;
    };

    const wallets = ref<Wallet[]>(supportAllWallets);
    watchEffect(() => {
      wallets.value = supportAllWallets
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

    watch(
      [selWalletIdx],
      () => {
        try {
          const wallet = wallets.value.find((it: Wallet) => it.name === selWalletIdx.value);
          if (!wallet) return;
          selWalletIcon.value = wallet.img;
          props.setWalletModal(wallet.source);
          emit('sel-changed', selWalletIdx.value);
          openOption.value = false;
        } catch (error) {
          console.error(error);
        }
      },
      { immediate: true }
    );

    return {
      openOption,
      closeOption,
      wallets,
      selWalletIdx,
      selWalletIcon,
      selWallet,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.box__row--wallet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  height: rem(56);
  width: rem(314);
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $gray-5;
  margin: 0 auto;
  margin-top: 16px;
  padding: 16px;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    border: 1px solid $astar-blue-dark;
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
  width: rem(314);
  left: 50%;
  transform: translate(-50%);
  z-index: 10;
  background: $container-bg-white;
  box-shadow: 0px 3px 0px rgba(180, 180, 180, 0.5);
  border-radius: 0px 0px 10px 10px;
}

.container--wallet {
  max-height: 228px;
  border-radius: 6px;
  padding-top: 4px;
  overflow: auto;
  overflow-x: hidden;
  width: rem(314);
  &:focus {
    outline: none;
  }
}

.body--dark {
  .box--wallet-option {
    background: $gray-6;
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.5);
  }
  .box__row--wallet {
    background: $gray-6;
    color: $gray-1;
  }
}
</style>
