<template>
  <div v-if="showBanner" class="banner">
    <span>
      <span class="text--attention">{{ $t('common.dappStaking') }}</span>
      <span>{{ $t('stakingV3.newPeriodWarning', { days: erasUntilNextPeriod }) }}</span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { PeriodType, useDappStaking, usePeriod } from 'src/staking-v3';

const erasBeforeVotingToShowBanner = 15;

export default defineComponent({
  setup() {
    const { periodCurrentDay, periodDuration } = usePeriod();
    const { protocolState } = useDappStaking();

    const erasUntilNextPeriod = computed<number>(() =>
      periodDuration.value && periodCurrentDay.value
        ? periodDuration.value - periodCurrentDay.value + 1
        : Number.MAX_SAFE_INTEGER
    );

    const showBanner = computed<boolean>(
      () =>
        protocolState.value?.periodInfo.subperiod === PeriodType.BuildAndEarn &&
        erasUntilNextPeriod.value <= erasBeforeVotingToShowBanner
    );

    return { showBanner, erasUntilNextPeriod };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.banner {
  background: linear-gradient(270deg, #ff94cd 26.04%, #e6007a 100%);
  color: $gray-2;
  font-weight: 600;
  padding: 4px 8px 8px 8px;
  font-size: 12px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  @media (min-width: $sm) {
    font-size: 14px;
    padding: 4px 16px 8px 16px;
  }
}

.text--attention {
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 4px;
  border: 1px solid $gray-2;
  margin-right: 4px;
  @media (min-width: $sm) {
    margin-right: 8px;
  }
}
</style>
