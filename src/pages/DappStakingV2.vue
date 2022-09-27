<template>
  <div class="wrapper--dapp-staking">
    <div class="container--dapp-staking">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {},
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
.wrapper--dapp-staking {
  margin: 0 auto;
}
.container--dapp-staking {
  display: grid;
  row-gap: 24px;
  max-width: 1300px;
  @media (max-width: $md) {
    display: block;
  }
}
</style>
