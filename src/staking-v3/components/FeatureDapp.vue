<template>
  <div class="wrapper--promo">
    <div class="row--title">
      <span class="text--promo-title"> New dapp promotion </span>
    </div>
    <div>
      <span> Ligtning-fast speed with near-zero gas fees dex in now available on Astar </span>
    </div>
    <div class="row--button">
      <astar-button class="button--link"> Stake on Singlar </astar-button>
    </div>
    <div class="row--data">
      <div class="card--data">
        <div class="card__top">
          <span class="text--card-title">BUILD</span>
        </div>
        <div class="card__bottom">
          <span class="text--value">21</span>
          <span class="text--value-small">/120</span>
        </div>
      </div>
      <div class="promo__data">
        <div class="card--data">
          <div class="card__top">
            <span class="text--card-title">Basic Rewards</span>
          </div>
          <div class="card__bottom">
            <span class="text--value">9.7%</span>
          </div>
        </div>
      </div>
      <div class="promo__data">
        <div class="card--data">
          <div class="card__top">
            <span class="text--card-title">Bonus Rewards</span>
          </div>
          <div class="card__bottom">
            <span class="text--value">2.3%</span>
          </div>
        </div>
      </div>
      <div class="promo__data">
        <div class="card--data">
          <div class="card__top">
            <span class="text--card-title">TVL</span>
          </div>
          <div class="card__bottom">
            <span class="text--value">39.4%</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row--start-staking">
      <button class="button--staking">
        <span class="text--start-staking">Start Staking Now</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
@use './styles/feature-dapp.scss';
</style>
