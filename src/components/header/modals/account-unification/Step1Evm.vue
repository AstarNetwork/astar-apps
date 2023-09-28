<template>
  <div>
    <div class="box--info">
      To create an unified account, both Substrate and EVM wallet extension are required and
      currently not possible from mobile apps.
    </div>

    <div class="box box--have">
      <div class="text--title">😎 I HAVE an Astar Native account</div>
      <p>
        Unified account is owned by an Astar Native account. Please connect with a desired address
        and create an account.
      </p>
      <astar-button class="btn" @click="handleBack()">Select a wallet</astar-button>
    </div>

    <div class="box box--not-have">
      <div class="text--title">🥲 I DON’T HAVE an Astar Native account</div>
      <p>
        You can receive full benefit while you are connecting with EVM account without unifying. So
        nothing to worry if you don’t own a Astar Native account. However there might be a feature
        that the unified account can benefit and you could always create an account anytime.
      </p>
      <p><a href="#">How to create a Astar Native account</a></p>
      <p>
        You could also find Substrate based wallets which might be friendlier.
        <a href="#">Check our Native wallets</a>.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

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
