<template>
  <div
    class="liquid-wrapper"
    :style="`background-image: url('${require('/src/assets/img/algem/algem_landing.jpg')}')`"
  >
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
          <a
            href="https://docs.algem.io/algem-protocol/liquid-staking/liquid-staking-faq"
            target="_blank"
            ><span class="icon-external"> <astar-icon-external-link /> </span
          ></a>
        </li>
      </ul>
    </div>
    <div class="text--final">Enjoy The Magic of Liquid Staking And Seize The Extra Earnings!</div>
    <a href="https://app.algem.io/liquid-staking" target="_blank">
      <button class="button btn--launch">
        <span class="icon-external"><astar-icon-external-link /></span> Launch Algem App
      </button>
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({});
</script>
<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/algem-panel.scss';
</style>
