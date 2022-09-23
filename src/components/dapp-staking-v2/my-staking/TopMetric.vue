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
@import 'src/css/quasar.variables.scss';

.panel {
  margin-bottom: 25px;
  border-radius: 0px 0px 6px 6px;
  padding-top: 92px;
  padding-bottom: 24px;
  padding-left: 28px;
  padding-right: 28px;

  @media (max-width: $lg) {
    padding-right: 0px;
  }
}
.wrapper--title {
  margin-left: 16px;
  margin-bottom: 32px;
  font-family: 'Objektiv Mk1';
  font-style: normal;
  font-weight: 800;
  color: $gray-1;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  .txt--title {
    font-size: 40px;
    line-height: 53px;
    letter-spacing: 0.1em;
  }
  .txt--subtitle {
    font-size: 24px;
    line-height: 27px;
  }
}

.wrapper--cards {
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 1295px;
  @media (max-width: $lg) {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: scroll;
    overflow-y: hidden;
    gap: 16px;
  }
}

.wrapper--icon-help {
  cursor: pointer;
  padding-top: 5px;
}

.card {
  display: flex;
  flex-direction: column;
  flex: none;
  flex-basis: 23.5%;
  min-width: 200px;
  height: 126px;
  padding: 40px 22px;
  background: linear-gradient(180deg, rgba(25, 29, 31, 0) 4.17%, rgba(255, 255, 255, 0.3) 79.69%);
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.2);
  border-radius: 6px;

  p {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
    font-size: 14px;
    color: $gray-1;
  }
  .row--data {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
    .value {
      display: flex;
      font-weight: 600;
      font-size: 20px;
      line-height: 18px;
      color: $gray-1;

      .detail-value {
        font-size: 12px;
        font-weight: 500;
        margin-left: 5px;
      }
      @media (max-width: $lg) {
        display: block;
      }
    }

    @media (max-width: $lg) {
      margin-top: 16px;
    }
  }

  @media (max-width: $lg) {
    min-width: 160px;
    flex-basis: 32%;
    height: 130px;
    padding: 40px 16px 16px 16px;
  }
}
</style>
