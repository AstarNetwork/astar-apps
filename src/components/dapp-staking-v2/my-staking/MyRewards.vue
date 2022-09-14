<template>
  <div class="wrapper--cards">
    <div class="card">
      <p>
        Total Staked
        <!-- <astar-icon-help />
        <q-tooltip
          v-model="isDisplayTooltip"
          anchor="top middle"
          :self="`bottom ${$q.platform.is.mobile ? 'end' : 'middle'}`"
          class="box--tooltip"
        >
          <span class="text--tooltip">{{ $t('common.speed.tipHelp') }}</span>
        </q-tooltip> -->
      </p>
      <div class="row--data">
        <div class="value">500,000 ASTR</div>
      </div>
    </div>
    <div class="card">
      <p>Available to claim</p>
      <div class="row--data">
        <div class="value">5 Era</div>
        <astar-button width="80" height="24">Claim</astar-button>
      </div>
    </div>
    <div class="card">
      <p>Re-Stake after claiming</p>
      <div class="row--data">
        <div class="value">ON</div>
        <astar-button width="80" height="24">Turn Off</astar-button>
      </div>
    </div>
    <div class="card">
      <p>Total Earned (all-time)</p>
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
  margin-top: 34px;

  @media (max-width: $lg) {
    gap: 16px;
  }

  @media (max-width: $sm) {
    flex-wrap: wrap;
  }
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