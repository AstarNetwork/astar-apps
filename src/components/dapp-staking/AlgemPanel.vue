<template>
  <div class="liquid-wrapper">
    <div class="text--title">
      Liquid Staking is the most flexible way to earn on Astar Network and Polkadot
    </div>
    <div class="text--run-by">
      Run by <img src="~assets/img/algem/algem_logo.png" width="90" height="40" />
    </div>
    <div class="wrapper--feature">
      <div class="text--subtitle">
        <img src="~assets/img/algem/algem_subtitle_1.png" width="31" height="32" /> Unlock The Full
        Power Of Your ASTR
      </div>
      <div class="text--desc">
        Unlock Astar's dApp staking mechanism and double-dip your earnings when you farm across
        Astar's DeFi ecosystem while simultaneously dApp staking!
      </div>
      <div class="text--subtitle">
        <img src="~assets/img/algem/algem_subtitle_2.png" width="31" height="32" /> Get One nASTR
        For Every ASTR You Stake
      </div>
      <div class="text--desc">
        Stake your ASTR tokens on any Astar Network project and receive liquid nASTR tokens at the
        same ratio (1:1).
      </div>
      <div class="text--subtitle">
        <img src="~assets/img/algem/algem_subtitle_3.png" width="31" height="32" /> Yield Farm With
        Your nASTR On Astar Network For Big Earnings
      </div>
      <div class="text--desc">
        Use nASTR across the Astar DeFi ecosystem, as you would with your ASTR, and maximize your
        profits.
      </div>
    </div>
    <div class="row--warn">
      <div>Please make sure you understand the following :</div>
      <ul>
        <li>
          Algem uses Astar’s dApp Staking mechanism, however Algem is a third party and Astar is not
          responsible for Algem’s services.
        </li>
        <li>
          Learn about the risk of providing liquidity on a DEX, impermanent loss (IL) and the
          possibility of a depeg.
        </li>
      </ul>
    </div>
    <div class="text--final">Enjoy The Magic of Liquid Staking And Seize The Extra Earnings!</div>
    <button class="button btn--launch">
      <span class="icon-external"><astar-icon-external-link /></span> Launch Algem App
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {},
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.liquid-wrapper {
  padding-top: 64px;
  padding-bottom: 80px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
}

.text--title {
  max-width: 1100px;
  font-weight: 600;
  font-size: 40px;
  line-height: 54px;
  color: #fff;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
  margin-left: 64px;
}

.text--run-by {
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: #fff;
  margin-left: 64px;
  display: inline-flex;
  align-items: center;

  img {
    margin-left: 8px;
  }
}

.wrapper--feature {
  background: linear-gradient(270deg, rgba(0, 0, 0, 0) -7.41%, rgba(16, 4, 4, 0.7) 45.98%);
  padding: 24px 64px;
}

.text--subtitle {
  color: #faae38;
  font-weight: 700;
  font-size: 18px;
  line-height: 32px;
  margin-top: 24px;
  display: inline-flex;

  img {
    margin-right: 16px;
  }
}

.text--desc {
  font-weight: 500;
  font-size: 18px;
  line-height: 32px;
  color: #fff;
}

.row--warn {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  color: #b1b7c1;
  background: linear-gradient(270deg, rgba(16, 4, 4, 0) 4.77%, rgba(16, 4, 4, 0.8) 65.26%);
  margin-top: 32px;
  margin-bottom: 32px;
  padding: 16px 64px;

  ul {
    list-style-type: disc;
  }
  li {
    margin-left: 25px;
  }
}

.text--final {
  font-weight: 600;
  font-size: 24px;
  line-height: 24px;
  color: #fff;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.5);
  margin-left: 64px;
}

.btn--launch {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 14px 0px;
  width: 315px;
  height: 52px;
  background: #faae38;
  border-radius: 30px;
  color: $gray-6;
  font-weight: 600;
  font-size: 20px;
  margin-top: 32px;
  margin-left: 64px;
}

.icon-external {
  stroke: $gray-6;
  margin-left: 28px;
  margin-right: 28px;
}
</style>
