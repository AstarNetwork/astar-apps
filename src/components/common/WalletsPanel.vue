<template>
  <div class="wrapper--wallets">
    <div
      v-for="(wallet, index) in wallets"
      :key="index"
      class="box__row--wallet box--hover--active"
      :class="currentWallet === wallet.source && 'border--active'"
      @click="setWalletModal(wallet.source)"
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
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { Wallet } from 'src/config/wallets';

export default defineComponent({
  props: {
    wallets: {
      type: Object as PropType<Wallet[]>,
      required: true,
    },
    currentWallet: {
      type: String,
      required: false,
      default: '',
    },
    setWalletModal: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const castWalletName = (wallet: string): string => {
      return wallet.split('(')[0].trim();
    };

    return {
      castWalletName,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--wallets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.border--active {
  border: 1px solid $astar-blue !important;
}

.box__row--wallet {
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  align-items: center;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  color: $gray-5;
  cursor: pointer;
  padding: 16px;
  padding-left: 24px;
  margin: 0 auto;
  border: 1px solid $navy-1;

  @media (min-width: 500px) {
    flex-direction: row;
    font-size: 16px;
    column-gap: 8px;
  }

  &:hover {
    border: 1px solid $astar-blue;
  }

  &:active {
    border: 2px solid $astar-blue;
  }
}

.box--img {
  width: 24px;
  height: 24px;
}

.body--dark {
  .title--account-type {
    color: $gray-1;
  }
  .box__row--wallet {
    color: $gray-1;
    border: 1px solid $gray-3;
  }
}
</style>
