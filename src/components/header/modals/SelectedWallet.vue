<template>
  <div class="box__row--wallet">
    <div class="wrapper--row--wallet">
      <img v-if="selWallet.img" width="24" :src="selWallet.img" />
      <div class="txt--wallet-name">{{ selWallet.name }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { supportAllWalletsObj, SupportWallet } from 'src/config/wallets';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    selectedWallet: {
      type: String as PropType<SupportWallet>,
      required: true,
    },
  },
  setup(props) {
    const selWallet = computed(() => supportAllWalletsObj[props.selectedWallet]);
    return {
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
  border-radius: 6px;
  height: rem(56);
  font-weight: 700;
  font-size: 16px;
  line-height: 18px;
  color: $gray-5;
  margin: 0 auto;
  margin-top: 16px;
  padding: 16px;
  border: 1px solid $navy-1;

  .wrapper--row--wallet {
    display: flex;
    align-items: center;

    .txt--wallet-name {
      margin-left: 8px;
    }
  }
}

.container--wallet {
  max-height: 228px;
  border-radius: 6px;
  padding-top: 4px;
  overflow: auto;
  overflow-x: hidden;
  width: 430px;
  &:focus {
    outline: none;
  }
}

.body--dark {
  .box__row--wallet {
    border: 1px solid $navy-1;
    color: $gray-1;
  }
}
</style>
