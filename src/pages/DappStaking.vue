<template>
  <div v-if="isReady" class="wrapper--dapp-staking">
    <div id="staking-top-bg" />
    <div class="container--dapp-staking">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { usePageReady } from 'src/hooks';
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>

<style lang="scss">
.wrapper--dapp-staking {
  height: 100%;
  padding: 0 16px;
  @media (min-width: $sm) {
    padding-top: 16px;
  }
  @media (min-width: $lg) {
    padding-left: 40px;
    padding-right: 40px;
    padding-top: 36px;
  }
}

.dapps-staking-bg {
  background-repeat: round;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
  z-index: 0;
  height: 100vh;
  opacity: 0.8;
}

.container--dapp-staking {
  height: 100%;
}
</style>
