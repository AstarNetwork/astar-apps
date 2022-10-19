<template>
  <div class="wrapper--cards">
    <div class="card">
      <p>
        {{ $t('myReward.totalStaked') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.totalStaked') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div v-if="isLoading" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value">
          <TokenBalance :balance="item.totalStaked.toString()" symbol="ASTR" />
        </div>
      </div>
    </div>
    <div class="card">
      <p>
        {{ $t('myReward.availableToClaim') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.availableToClaim') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div v-if="isLoading" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value">{{ amountOfEras }} {{ $t('myReward.era') }}</div>
        <astar-button width="80" height="24" :disabled="!canClaim" @click="claimAll">{{
          $t('myReward.claim')
        }}</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        {{ $t('myReward.restake') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.restake') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div class="value">{{ isCompounding ? $t('dappStaking.on') : $t('dappStaking.off') }}</div>
        <astar-button width="80" height="24" @click="changeDestinationForRestaking">{{
          isCompounding ? $t('dappStaking.turnOff') : $t('dappStaking.turnOn')
        }}</astar-button>
      </div>
    </div>
    <div class="card">
      <p>
        {{ $t('myReward.totalEarned') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
        </span>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('myReward.totalEarned') }}</span>
        </q-tooltip>
      </p>
      <div class="row--data">
        <div v-if="isLoadingClaimed" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value"><TokenBalance :balance="claimed.toString()" symbol="ASTR" /></div>
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
import { defineComponent, ref } from 'vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useClaimAll } from 'src/hooks';
import { useCompoundRewards, RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import { useClaimedReward } from 'src/hooks/dapps-staking/useClaimedReward';

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup() {
    const item = {
      totalStaked: 500000,
      totalEarned: 10000,
    };
    const { claimAll, canClaim, amountOfEras, isLoading } = useClaimAll();

    const { isSupported, isCompounding, setRewardDestination } = useCompoundRewards();
    const changeDestinationForRestaking = async () => {
      const newDestination = isCompounding.value
        ? RewardDestination.FreeBalance
        : RewardDestination.StakeBalance;
      await setRewardDestination(newDestination);
    };

    const { claimed, isLoadingClaimed } = useClaimedReward();

    return {
      item,
      isLoading,
      amountOfEras,
      canClaim,
      claimAll,
      isCompounding,
      changeDestinationForRestaking,
      isLoadingClaimed,
      claimed,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-rewards.scss';
</style>