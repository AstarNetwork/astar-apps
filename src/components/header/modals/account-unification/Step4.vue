<template>
  <div class="wrapper--account-unification">
    <p class="text">Your balance in the EVM account are going to be transferred.</p>
    <div class="evm-token-list">
      <div class="row">
        <div class="column--icon">
          <img :src="icon_img.astar_gradient" />
        </div>
        <div class="column--name">
          <span class="symbol">DOT</span>
          <span class="name">Polkadot</span>
        </div>
        <div class="column--balance">
          <span class="token">2,000,000.000 DOT</span>
          <span class="usd">2,000,000.000 USD</span>
        </div>
      </div>
      <div class="row">
        <div class="column--icon">
          <img :src="icon_img.astar_gradient" />
        </div>
        <div class="column--name">
          <span class="symbol">DOT</span>
          <span class="name">Polkadot</span>
        </div>
        <div class="column--balance">
          <span class="token">2,000,000.000 DOT</span>
          <span class="usd">2,000,000.000 USD</span>
        </div>
      </div>
    </div>

    <!-- Action -->
    <div>
      <astar-button class="btn" @click="next()">Transfer</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {},
  emits: ['next'],
  setup(props, { emit }) {
    const next = () => {
      emit('next');
    };

    const icon_img = {
      astar_gradient: require('/src/assets/img/astar_icon.svg'),
    };

    return {
      icon_img,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
