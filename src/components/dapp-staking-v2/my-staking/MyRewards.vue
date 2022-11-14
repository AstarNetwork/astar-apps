<template>
  <div class="wrapper--cards">
    <div class="card">
      <div class="row--title">
        {{ $t('myReward.totalStaked') }}
      </div>
      <div class="row--data">
        <div class="value">
          <q-skeleton v-if="isLoadingTotalStaked" animation="fade" class="skeleton--md" />
          <token-balance v-else :balance="totalStaked" :symbol="nativeTokenSymbol" :decimals="0" />
        </div>
      </div>
    </div>
    <div class="card">
      <div class="row--title">
        {{ $t('myReward.availableToClaim') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
          <q-tooltip max-width="200px" class="box--tooltip">
            <span class="text--tooltip">{{ $t('myReward.availableToClaimTip') }}</span>
          </q-tooltip>
        </span>
      </div>
      <div class="row--data">
        <div v-if="isLoading" class="loading">
          <q-skeleton type="rect" animation="fade" />
        </div>
        <div v-else class="value">{{ amountOfEras }} {{ $t('myReward.era') }}</div>
        <astar-button :width="80" :height="24" :disabled="!canClaim" @click="claimAll">{{
          $t('myReward.claim')
        }}</astar-button>
      </div>
    </div>
    <div class="card">
      <div class="row--title">
        {{ $t('myReward.restake') }}
        <span class="wrapper--icon-help">
          <astar-icon-help size="16" />
          <q-tooltip max-width="200px" class="box--tooltip">
            <span class="text--tooltip">{{ $t('myReward.restakeTip') }}</span>
          </q-tooltip>
        </span>
      </div>
      <div class="row--data">
        <div class="value">{{ isCompounding ? $t('dappStaking.on') : $t('dappStaking.off') }}</div>
        <astar-button :width="80" :height="24" @click="changeDestinationForRestaking">
          {{ isCompounding ? $t('dappStaking.turnOff') : $t('dappStaking.turnOn') }}
        </astar-button>
      </div>
    </div>
    <div class="card">
      <div class="row--title">
        {{ $t('myReward.totalEarned') }}
      </div>
      <div class="row--data">
        <div class="value">
          <token-balance :balance="claimed.toString()" :symbol="nativeTokenSymbol" />
        </div>
        <astar-irregular-button @click="goToSubscan">
          <div class="explorer-icon">
            <astar-icon-external-link />
          </div>
        </astar-irregular-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useAccount, useClaimAll, useNetworkInfo, useStakerInfo } from 'src/hooks';
import { useClaimedReward } from 'src/hooks/dapps-staking/useClaimedReward';
import { RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import { endpointKey } from 'src/config/chainEndpoints';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { claimAll, canClaim, amountOfEras, isLoading } = useClaimAll();
    const { totalStaked, isLoadingTotalStaked } = useStakerInfo();

    const changeDestinationForRestaking = async () => {
      const newDestination = isCompounding.value
        ? RewardDestination.FreeBalance
        : RewardDestination.StakeBalance;
      await setRewardDestination(newDestination);
    };

    const { claimed, isLoadingClaimed, isCompounding, setRewardDestination } = useClaimedReward();
    const { currentAccount } = useAccount();
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const goToSubscan = () => {
      let rootName = 'astar';
      if (isShiden.value) {
        rootName = 'shiden';
      }
      const link = `https://${rootName}.subscan.io/account/${currentAccount.value}?tab=reward`;
      window.open(link, '_blank');
    };

    return {
      isLoading,
      amountOfEras,
      canClaim,
      claimAll,
      isCompounding,
      changeDestinationForRestaking,
      isLoadingClaimed,
      claimed,
      totalStaked,
      nativeTokenSymbol,
      isLoadingTotalStaked,
      goToSubscan,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-rewards.scss';
</style>
