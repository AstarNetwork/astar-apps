<template>
  <div class="wrapper--data--list">
    <div class="row--title">{{ $t('stakingV3.general') }}</div>
    <div class="row--data-list">
      <data-card
        :title="`${$t('stakingV3.period')}`"
        :description="
          isVotingPeriod ? $t('stakingV3.voteDescription') : $t('stakingV3.buildAndEarnDescription')
        "
      >
        {{ periodName }}
      </data-card>
      <data-card
        :title="`${$t('stakingV3.duration')}`"
        :description="$t('stakingV3.durationDescription')"
      >
        {{ periodRemainingDays }} / {{ periodDuration }}
      </data-card>
      <data-card :title="$t('stakingV3.era')" :description="$t('stakingV3.eraDescription')">
        {{ protocolState?.era ?? '--' }}
      </data-card>
      <data-card
        :title="$t('stakingV3.stakingAndLockingAccounts')"
        :description="$t('stakingV3.numberOfStakersAndLockersDescription')"
      >
        {{ numberOfStakersAndLockers.stakersCount }} / {{ numberOfStakersAndLockers.lockersCount }}
      </data-card>
    </div>

    <div class="row--title">{{ $t('stakingV3.tvl') }}</div>
    <div class="row--data-list">
      <data-card
        :title="$t('stakingV3.totalValueLocked', { token: nativeTokenSymbol })"
        :description="$t('stakingV3.totalValueLockedDescription')"
      >
        <format-balance :balance="tvl.toString() ?? ''" />
      </data-card>
      <data-card
        :title="`${$t('stakingV3.tvl')}`"
        :description="
          $t('stakingV3.tvlDescription', {
            tvlAmount: formattedTvlBalance,
            tvlPercentage: $n(tvlPercentage),
          })
        "
      >
        {{ $n(tvlPercentage) }} %
      </data-card>
      <data-card
        :title="`${$t('stakingV3.stakedToLockedRatio')}`"
        :description="$t('stakingV3.tvvDescription')"
      >
        {{ $n(totalVolumeOfVotesPercentage) }} %
      </data-card>
    </div>

    <div class="row--title">{{ $t('stakingV3.builderRewards') }}</div>
    <div class="row--data-list">
      <data-card
        :title="$t('stakingV3.numberOfDapps')"
        :description="$t('stakingV3.numberOfDappsDescription')"
      >
        {{ totalDapps }}
      </data-card>
      <data-card
        :title="$t('stakingV3.unfilledSlot')"
        :description="$t('stakingV3.unfilledSlotDescription')"
      >
        {{ unfilledSlots }} / {{ tiersConfiguration.numberOfSlots }}
      </data-card>
      <data-card
        :title="$t('stakingV3.dAppsSlots')"
        :description="$t('stakingV3.dAppsSlotsDescription')"
      >
        {{ dAppTiers?.dapps.length ?? 0 }} / {{ tiersConfiguration.numberOfSlots }}
      </data-card>
      <data-card
        :title="$t('stakingV3.tokensToBeBurned')"
        :description="$t('stakingV3.tokensToBeBurnedDescription')"
      >
        <format-balance :balance="tokensToBeBurned.toString() ?? ''" />
      </data-card>
    </div>

    <div class="row--title">{{ $t('stakingV3.stakerRewards') }}</div>
    <div class="row--data-list">
      <data-card
        :title="$t('stakingV3.bonusPool')"
        :description="$t('stakingV3.bonusPoolDescription')"
        :link-url="docsUrl.tokenomics2"
        :link-label="$t('stakingV3.tokenomics')"
      >
        <format-balance
          :balance="activeInflationConfiguration.bonusRewardPoolPerPeriod.toString() ?? ''"
        />
      </data-card>
      <data-card
        :title="$t('stakingV3.loyaltyStake')"
        :description="$t('stakingV3.bonusEligibleTokensDescription')"
      >
        <format-balance :balance="bonusEligibleTokens.toString() ?? ''" />
      </data-card>
    </div>

    <!-- Memo: hide for this moment. we should have Stake Unlock together. -->
    <div v-if="false" class="row--data-list">
      <data-card :title="$t('stakingV3.unlocking')" description="description">
        <format-balance :balance="unlocking.toString() ?? ''" />
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
import { docsUrl } from 'src/links';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';

export default defineComponent({
  components: {
    DataCard,
    FormatBalance,
  },
  setup() {
    const { protocolState, currentEraInfo, dAppTiers, tiersConfiguration, isVotingPeriod } =
      useDappStaking();
    const { registeredDapps } = useDapps();
    const { periodName, periodDuration, periodCurrentDay } = usePeriod();
    const {
      tvlPercentage,
      totalVolumeOfVotesPercentage,
      bonusEligibleTokens,
      numberOfStakersAndLockers,
      tokensToBeBurned,
    } = useDataCalculations();
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

    const periodRemainingDays = computed<number>(() => {
      if (periodDuration.value && periodCurrentDay.value) {
        return periodDuration.value - periodCurrentDay.value;
      }
      return 0;
    });

    const formattedTvlBalance = computed<string>(() =>
      balanceFormatter(tvl.value.toString() ?? '')
    );

    return {
      protocolState,
      periodName,
      periodDuration,
      totalDapps,
      tvl,
      unlocking,
      dAppTiers,
      unfilledSlots,
      tiersConfiguration,
      tvlPercentage,
      tokensToBeBurned,
      totalVolumeOfVotesPercentage,
      bonusEligibleTokens,
      activeInflationConfiguration,
      numberOfStakersAndLockers,
      nativeTokenSymbol,
      periodRemainingDays,
      isVotingPeriod,
      docsUrl,
      formattedTvlBalance,
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
