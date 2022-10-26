<template>
  <div
    class="card"
    :style="`background-image: url(${require('/src/assets/img/banner/banner-algem.png')})`"
    @click="linkLaunchApp"
  >
    <div class="txt--subtitle">dApps Staking is available on EVM</div>
    <div class="algem-logo">
      <img src="~assets/img/algem/algem_logo.png" width="90" height="40" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const linkLaunchApp = () => {
      window.open('https://app.algem.io/liquid-staking', '_blank');
    };

    return {
      linkLaunchApp,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.card {
  flex-basis: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #d9d9d9;
  background-size: cover;
  height: 127px;
  border-radius: 5px;
  padding: 24px 30px;
  .txt--subtitle {
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 19px;
    display: flex;
    align-items: center;
    color: #fff;
    text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
    @media (max-width: $sm) {
      max-width: 125px;
    }
  }

  @media (max-width: $sm) {
    margin-bottom: 20px;
  }
}
</style>