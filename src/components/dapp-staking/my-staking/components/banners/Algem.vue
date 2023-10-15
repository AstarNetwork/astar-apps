<template>
  <div class="card" @click="linkLaunchApp">
    <div>
      <span class="txt--subtitle">
        {{ $t('dappStaking.dappStakingEvm') }}
      </span>
    </div>
    <div class="algem-logo">
      <div class="img--algem" />
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

.img--algem {
  background-image: url('src/assets/img/algem/algem_high.svg');
  width: 110px;
  height: 40px;
}

.card {
  flex-basis: 50%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #d9d9d9;
  background-size: cover;
  min-height: 127px;
  border-radius: 5px;
  padding: 24px 46px;
  background-image: url('src/assets/img/banner/banner-algem.png');
  column-gap: 12px;
  margin-bottom: 20px;
  @media (min-width: $sm) {
    margin-bottom: 0;
  }
  .txt--subtitle {
    font-style: normal;
    font-weight: 600;
    font-size: 16px;
    line-height: 19px;
    display: flex;
    align-items: center;
    color: #fff;
    text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
    max-width: 125px;
    @media (min-width: $sm) {
      max-width: 100%;
    }
  }
}
</style>
