<template>
  <div class="wrapper--cards">
    <div class="card">
      <p>
        Total Staked
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Total Staked</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">500,000 ASTR</div>
      </div>
    </div>
    <div class="card">
      <p>
        Available to claim
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Available to claim</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">5 Era</div>
        <astar-button width="80" height="24">Claim</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        Re-Stake after claiming
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Re-Stake after claiming</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">ON</div>
        <astar-button width="80" height="24">Turn Off</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        Total Earned (all-time)
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">Total Earned (all-time)</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">10,000 ASTR</div>
        <astar-irregular-button>
          <div class="explorer-icon">
            <astar-icon-external-link />
          </div>
        </astar-irregular-button>
      </div>
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
@import 'src/css/quasar.variables.scss';

.wrapper--cards {
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 1295px;
  margin-top: 34px;
  padding-right: 25px;

  @media (max-width: $lg) {
    gap: 16px;
  }

  @media (max-width: $sm) {
    flex-wrap: wrap;
    padding-right: 0;
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
  flex-basis: 24%;
  // width: 294px;
  min-width: 120px;
  height: 142px;
  background: $gray-1;
  border-radius: 6px;
  padding: 40px 24px;

  p {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 600;
    font-size: 14px;
    color: $gray-3;
  }
  .row--data {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 23px;
  }
  .value {
    font-weight: 600;
    font-size: 20px;
    line-height: 18px;
    color: $gray-5-selected;
  }

  @media (max-width: $lg) {
    min-width: 100px;
    height: 114px;
    padding: 24px 16px;

    .row--data {
      margin-top: 15px;
    }
  }

  @media (max-width: $sm) {
    display: block;
    width: 100%;
    flex-basis: 100%;
  }
}

.explorer-icon {
  stroke: $astar-blue;
  svg {
    height: 30px;
    width: 30px;
  }
  &:hover {
    stroke: white;
  }
}

.body--dark {
  .card {
    background: $gray-6;
    box-shadow: 0px 0px 20px 5px rgba(0, 0, 0, 0.15);

    p {
      color: #9da3ae;
    }

    .value {
      color: $gray-1;
    }
  }
}
</style>