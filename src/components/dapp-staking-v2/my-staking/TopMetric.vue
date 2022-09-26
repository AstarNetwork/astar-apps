<template>
  <div
    class="panel"
    :style="`background-image: url('${require('/src/assets/img/header-img-dappstaking.jpg')}')`"
  >
    <div class="wrapper--title">
      <div class="txt--title">Build2Earn</div>
      <div class="txt--subtitle">An innovative way of Staking</div>
    </div>
    <div class="wrapper--cards">
      <div class="card">
        <p>
          TVL in dApps
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">TVL in dApps</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div class="value">2.933B ASTR ($139.5M)</div>
        </div>
      </div>
      <div class="card">
        <p>
          Current Era
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">Current Era</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div class="value">
            <div>120</div>
            <div class="detail-value">(ETA 06:20 10-Jun)</div>
          </div>
        </div>
      </div>
      <div class="card">
        <p>
          Current Stakers APR
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">Current Stakers APR</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div class="value">10.23%</div>
        </div>
      </div>
      <div class="card">
        <p>
          Total dApps
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
          </span>
          <q-tooltip>
            <span class="text--tooltip">Total dApps</span>
          </q-tooltip>
        </p>
        <div class="row--data">
          <div class="value">120</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {},
});
</script>
<style lang="scss" scoped>
@import './styles/top-metric.scss';
</style>
