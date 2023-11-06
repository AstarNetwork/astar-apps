<template>
  <div>
    <div class="box--info">
      {{ $t('wallet.unifiedAccount.requirement') }}
    </div>

    <div class="box box--have">
      <div class="text--title">{{ $t('wallet.unifiedAccount.haveAstarNative') }}</div>
      <p>
        {{ $t('wallet.unifiedAccount.connectAstarNative') }}
      </p>
      <astar-button class="btn" @click="handleBack()">
        {{ $t('wallet.unifiedAccount.selectWallet') }}
      </astar-button>
    </div>

    <div class="box box--not-have">
      <div class="text--title">{{ $t('wallet.unifiedAccount.notHaveAstarNative') }}</div>
      <p>
        {{ $t('wallet.unifiedAccount.withoutUnifying') }}
      </p>
      <p>
        <a href="#">{{ $t('wallet.unifiedAccount.howToCreate') }}</a>
      </p>
      <p>
        {{ $t('wallet.unifiedAccount.findSubstrateWallets') }}
        <a href="#">{{ $t('wallet.unifiedAccount.checkNativeWallets') }}</a>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: {
    handleBack: {
      type: Function,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
