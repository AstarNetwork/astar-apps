<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
.container--dapp-staking {
  display: grid;
  row-gap: 24px;
  max-width: 1300px;
}

.wrapper--dapp-staking {
  position: relative;
  @media (min-width: $xxl) {
    display: flex;
    justify-content: center;
  }
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}
</style>
