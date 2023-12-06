<template>
  <div class="wrapper--data--list">
    <data-card :title="`${$t('stakingV3.vote')}/${$t('stakingV3.build')}`">{{
      periodName
    }}</data-card>
    <data-card :title="`${$t('stakingV3.day')} /${periodDuration}`">{{
      periodCurrentDay
    }}</data-card>
    <data-card :title="$t('stakingV3.era')">{{ protocolState?.era }}</data-card>
    <data-card :title="$t('stakingV3.tvl')">
      <token-balance-native :balance="tvl" />
    </data-card>
    <data-card :title="$t('stakingV3.unbonding')">
      <token-balance-native :balance="unlocking" />
    </data-card>
    <data-card :title="$t('stakingV3.numberOfDapps')">{{ totalDapps }}</data-card>
    <data-card :title="$t('stakingV3.filledSlot')">{{ dAppTiers?.dapps.length ?? 0 }}</data-card>
    <data-card :title="$t('stakingV3.unfilledSlot')">{{ unfilledSlots }}</data-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import DataCard from './DataCard.vue';
import { useDappStaking, useDapps } from 'src/staking-v3/hooks';
import { PeriodType } from '../../logic';
import { useI18n } from 'vue-i18n';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    DataCard,
    TokenBalanceNative,
  },
  setup() {
    const { t } = useI18n();
    const {
      protocolState,
      constants,
      currentEraInfo,
      dAppTiers,
      tiersConfiguration,
      currentBlock,
    } = useDappStaking();
    const { registeredDapps } = useDapps();

    const periodName = computed<string>(() =>
      protocolState.value?.periodInfo.subperiod === PeriodType.Voting
        ? t('stakingV3.vote')
        : t('stakingV3.build')
    );

    const periodDuration = computed<number | undefined>(() =>
      protocolState.value?.periodInfo.subperiod === PeriodType.Voting
        ? constants.value?.standardErasPerVotingPeriod
        : constants.value?.standardErasPerBuildAndEarnPeriod
    );

    const periodCurrentDay = computed<number | undefined>(() => {
      if (!protocolState.value || !constants.value) {
        return undefined;
      }

      if (protocolState.value.periodInfo.subperiod === PeriodType.BuildAndEarn) {
        return (
          (periodDuration.value ?? 0) -
          (protocolState.value.periodInfo.nextSubperiodStartEra - protocolState.value.era) +
          1
        );
      } else {
        // Voting is a bit special case. The subperiod takes standardErasPerVotingPeriod time,
        // but at the end of the period era number will increase by 1.
        return (
          constants.value.standardErasPerVotingPeriod -
          Math.floor(
            (protocolState.value.nextEraStart - currentBlock.value) /
              constants.value.standardEraLength
          )
        );
      }
    });

    const totalDapps = computed<number>(() => registeredDapps.value?.length ?? 0);
    const tvl = computed<string>(() => (currentEraInfo.value?.totalLocked ?? BigInt(0)).toString());
    const unlocking = computed<string>(() =>
      (currentEraInfo.value?.unlocking ?? BigInt(0)).toString()
    );
    const unfilledSlots = computed<number>(
      () => tiersConfiguration.value.numberOfSlots - dAppTiers.value.dapps.length
    );

    return {
      protocolState,
      periodName,
      periodDuration,
      periodCurrentDay,
      totalDapps,
      tvl,
      unlocking,
      dAppTiers,
      unfilledSlots,
    };
  },
});
</script>

<style lang="scss" scoped>
.wrapper--data--list {
  display: grid;
  width: 100%;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (min-width: $md) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
