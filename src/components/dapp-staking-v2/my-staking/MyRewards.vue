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
      <div class="row--value">500,000 ASTR</div>
    </div>
    <div class="card">
      <p>Available to claim</p>
      <div class="row--value">5 Era</div>
    </div>
    <div class="card">
      <p>Re-Stake after claiming</p>
      <div class="row--value">ON</div>
    </div>
    <div class="card">
      <p>Total Earned (all-time)</p>
      <div class="row--value">10,000 ASTR</div>
    </div>
  </div>
</template>
<script lang="ts">

</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--cards {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 34px;
}

.card {
  width: 294px;
  height: 142px;
  background: $gray-1;
  border-radius: 6px;
  padding: 40px 24px;

  p {
    font-weight: 600;
    font-size: 14px;
    color: $gray-3;
  }
  .row--value {
    font-weight: 600;
    font-size: 20px;
    line-height: 18px;
    color: $gray-5-selected;
    margin-top: 23px;
  }
}

.body--dark {
  .card {
    background: $gray-6;
    box-shadow: 0px 0px 20px 5px rgba(0, 0, 0, 0.15);

    p {
      color: #9da3ae;
    }

    .row--value {
      color: $gray-1;
    }
  }
}
</style>