<template>
  <div v-if="protocolState?.periodInfo.subperiod === PeriodType.BuildAndEarn" class="wrapper-info">
    <div class="wrapper-info-inner">
      <div class="panel build-panel">
        <div class="header">
          <div class="title">
            <span>{{ protocolState?.periodInfo.number.toString().padStart(3, '0') ?? '--' }}</span>
            <span>{{ $t('stakingV3.buildAndEarn') }}</span>
          </div>
          <div></div>
        </div>
        <div class="kpis">
          <gradient-kpi
            :title="$t('stakingV3.remainingTime')"
            :value="remainingEras?.toString() ?? '--'"
            :unit="
              remainingEras === 1
                ? $t('stakingV3.day', { day: '' })
                : $t('stakingV3.days', { day: '' })
            "
          />
          <gradient-kpi
            :title="$t('stakingV3.stakingAPR')"
            :value="formatApr(stakerApr)"
            unit="%"
          />
          <gradient-kpi :title="$t('stakingV3.bonusAPR')" :value="formatApr(bonusApr)" unit="%" />
        </div>
      </div>
      <div class="panel build-panel">
        <div class="header">
          <div class="title no-separator">
            {{ $t('stakingV3.rewards') }}
          </div>
          <div @click="navigateToAssets()">
            {{ $t('stakingV3.manageStakingAssets') }} <astar-icon-arrow-right />
          </div>
        </div>
        <div class="rewards">
          <div class="rewards-row">
            <div class="rewards-row__left">
              <div>{{ $t('stakingV3.estimatedRewards') }}</div>
              <div class="rewards-row__amount">
                <token-balance-native :balance="rewards?.staker.amount.toString() ?? ''" />
              </div>
            </div>
            <div>
              <claim-and-restake-button :claim-type="ClaimType.Staker" />
            </div>
          </div>
          <div class="rewards-row">
            <div class="rewards-row__left">
              <div>{{ $t('stakingV3.estimatedBonus') }}</div>
              <div class="rewards-row__amount">
                <token-balance-native :balance="bonusToDisplay?.toString() ?? ''" />
              </div>
            </div>
            <div>
              <claim-and-restake-button :claim-type="ClaimType.Bonus" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { ethers } from 'ethers';
import { truncate } from '@astar-network/astar-sdk-core';
import { PeriodType, ClaimType } from 'src/staking-v3/logic';
import { useAprV3, useDappStaking, useDappStakingNavigation, usePeriod } from '../hooks';
import GradientKpi from './GradientKpi.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import ClaimAndRestakeButton from './ClaimAndRestakeButton.vue';

export default defineComponent({
  components: { GradientKpi, TokenBalanceNative, ClaimAndRestakeButton },
  setup() {
    const { protocolState, rewards } = useDappStaking();
    const { navigateToAssets } = useDappStakingNavigation();
    const { remainingEras } = usePeriod();
    const { stakerApr, bonusApr, getEstimatedBonus } = useAprV3({ isWatch: true });

    const estimatedBonus = ref<bigint>();
    const bonusToDisplay = computed<bigint>(() => estimatedBonus.value || rewards.value.bonus);

    const formatApr = (apr: number | undefined): string => {
      return apr ? truncate(apr, 2).toString() : '--';
    };

    watch(
      [rewards],
      async () => {
        const estimated = await getEstimatedBonus();
        estimatedBonus.value = ethers.utils.parseEther(estimated.toString()).toBigInt();
      },
      { immediate: true }
    );

    return {
      PeriodType,
      ClaimType,
      protocolState,
      remainingEras,
      stakerApr,
      bonusApr,
      rewards,
      bonusToDisplay,
      formatApr,
      navigateToAssets,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import './styles/period-info.scss';

.build-panel {
  flex-direction: column;
  gap: 24px;
}

.header {
  align-items: center;

  div:last-child {
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
}

.kpis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;

  @media (min-width: $md) {
    flex-direction: row;
  }
}

.rewards {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.rewards-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  gap: 16px;

  .rewards-row__left {
    flex: 1;

    @media (min-width: $lg) {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }
  }

  .rewards-row__amount {
    font-size: 16px;
    font-weight: 800;
  }
}
</style>
