<template>
  <div class="wrapper--data--list">
    <div class="row--title">{{ $t('stakingV3.general') }}</div>
    <div class="row--data-list">
      <data-card
        :title="`${$t('stakingV3.vote')} / ${$t('stakingV3.buildAndEarn')}`"
        :description="$t('stakingV3.buildAndEarnDescription')"
      >
        {{ periodName }}
      </data-card>
      <data-card :title="`${$t('stakingV3.day')} / ${periodDuration}`" description="description">
        {{ periodCurrentDay }}
      </data-card>
      <data-card :title="$t('stakingV3.era')" description="description">
        {{ protocolState?.era }}
      </data-card>
    </div>

    <div class="row--title">{{ $t('stakingV3.tvl') }}</div>
    <div class="row--data-list">
      <data-card
        :title="$t('stakingV3.totalValueLocked', { token: nativeTokenSymbol })"
        description="description"
      >
        <format-balance :balance="tvl.toString() ?? ''" />
      </data-card>
      <data-card :title="`${$t('stakingV3.tvl')}`" description="description">
        {{ $n(tvlPercentage) }} %
      </data-card>
      <data-card :title="`${$t('stakingV3.tvv')}`" description="description">
        {{ $n(totalVolumeOfVotesPercentage) }} %
      </data-card>
      <data-card :title="$t('stakingV3.unlocking')" description="description">
        <format-balance :balance="unlocking.toString() ?? ''" />
      </data-card>
    </div>

    <div class="row--title">{{ $t('stakingV3.builderRewards') }}</div>
    <div class="row--data-list">
      <data-card :title="$t('stakingV3.numberOfDapps')" description="description">
        {{ totalDapps }}
      </data-card>
      <data-card :title="$t('stakingV3.unfilledSlot')" description="description">
        {{ unfilledSlots }} / {{ tiersConfiguration.numberOfSlots }}
      </data-card>
      <data-card :title="$t('stakingV3.filledSlot')" description="description">
        {{ dAppTiers?.dapps.length ?? 0 }} / {{ tiersConfiguration.numberOfSlots }}
      </data-card>
    </div>

    <div class="row--title">{{ $t('stakingV3.stakerRewards') }}</div>
    <div class="row--data-list">
      <data-card :title="$t('stakingV3.bonusPool')" description="description">
        <format-balance
          :balance="activeInflationConfiguration.bonusRewardPoolPerPeriod.toString() ?? ''"
        />
      </data-card>
      <data-card :title="$t('stakingV3.bonusEligibleTokens')" description="description">
        <format-balance :balance="bonusEligibleTokens.toString() ?? ''" />
      </data-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useDataCalculations } from 'src/staking-v3/hooks';
import DataCard from './DataCard.vue';
import { useDappStaking, useDapps, usePeriod } from 'src/staking-v3/hooks';
import { useInflation } from 'src/hooks/useInflation';
import FormatBalance from 'src/components/common/FormatBalance.vue';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  components: {
    DataCard,
    FormatBalance,
  },
  setup() {
    const { protocolState, currentEraInfo, dAppTiers, tiersConfiguration } = useDappStaking();
    const { registeredDapps } = useDapps();
    const { periodName, periodDuration, periodCurrentDay } = usePeriod();
    const { tvlPercentage, totalVolumeOfVotesPercentage, bonusEligibleTokens } =
      useDataCalculations();
    const { activeInflationConfiguration } = useInflation();

    const totalDapps = computed<number>(() => registeredDapps.value?.length ?? 0);
    const tvl = computed<string>(() => (currentEraInfo.value?.totalLocked ?? BigInt(0)).toString());
    const unlocking = computed<string>(() =>
      (currentEraInfo.value?.unlocking ?? BigInt(0)).toString()
    );
    const unfilledSlots = computed<number>(
      () => tiersConfiguration.value.numberOfSlots - dAppTiers.value.dapps.length
    );

    const { nativeTokenSymbol } = useNetworkInfo();

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
      tiersConfiguration,
      tvlPercentage,
      totalVolumeOfVotesPercentage,
      bonusEligibleTokens,
      activeInflationConfiguration,
      nativeTokenSymbol,
    };
  },
});
</script>

<style lang="scss" scoped>
.row--title {
  color: $navy-1;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

.row--data-list {
  margin-bottom: 24px;
  display: flex;
  width: 100%;
  gap: 8px;
  flex-direction: column;
  @media (min-width: $sm) {
    flex-direction: row;
  }
}
</style>
