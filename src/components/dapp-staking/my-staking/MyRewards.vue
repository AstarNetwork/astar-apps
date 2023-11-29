<template>
  <div>
    <div class="wrapper--cards">
      <div class="card">
        <div class="row--title">
          {{ $t('myReward.totalStaked') }}
        </div>
        <div class="row--data">
          <div class="value">
            <q-skeleton
              v-if="isLoadingTotalStaked || isLoading"
              animation="fade"
              class="skeleton--md"
            />
            <token-balance
              v-else
              :balance="totalStaked"
              :symbol="nativeTokenSymbol"
              :decimals="0"
            />
          </div>
        </div>
      </div>
      <div v-if="isDappDeveloper" class="card">
        <div class="row--title">
          {{ $t('myReward.availableToClaim') }}
        </div>
        <div class="row--data">
          <div v-if="isLoading" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value">
            {{ amountOfEras }} {{ $t('myReward.era') }}{{ amountOfEras > 1 ? 's' : '' }}
          </div>
          <astar-button
            :width="80"
            :height="24"
            :disabled="!canClaim || !canClaimWithoutError"
            @click="claimAll"
          >
            {{ $t('myReward.claim') }}
          </astar-button>
        </div>
      </div>
      <div v-else class="card">
        <div class="row--title">
          {{ $t('myReward.estimatedRewards') }}
          <span class="wrapper--icon-help">
            <astar-icon-help size="16" />
            <q-tooltip max-width="200px" class="box--tooltip">
              <div>
                <span class="text--tooltip">{{ $t('myReward.availableToClaimTip') }}</span>
              </div>
              <div>
                <span class="text--tooltip">{{ $t('myReward.availableToClaimTip2') }}</span>
              </div>
            </q-tooltip>
          </span>
        </div>

        <div class="row--data">
          <div v-if="isLoadingPendingRewards" class="loading">
            <q-skeleton type="rect" animation="fade" />
          </div>
          <div v-else class="value value--claim">
            <div>
              <span class="text--rewards-amount">
                {{ $n(pendingRewards) }} {{ nativeTokenSymbol }}
              </span>
            </div>
            <div class="row--eras">
              <span class="text--eras">
                ({{ amountOfEras }} {{ $t('myReward.era') }}{{ amountOfEras > 1 ? 's' : '' }})
              </span>
              <span class="wrapper--icon-help">
                <astar-icon-help size="16" />
                <q-tooltip max-width="200px" class="box--tooltip">
                  <div>
                    <span class="text--tooltip">{{ $t('myReward.claimable.limitation') }}</span>
                  </div>
                  <br />
                  <div class="row--ledgers">
                    <span class="text--tooltip">{{ $t('myReward.claimable.nativeWallets') }}</span>
                    <span class="text--tooltip">{{ $t('myReward.claimable.ledgerX') }}</span>
                    <span class="text--tooltip">{{ $t('myReward.claimable.ledgerSPlus') }}</span>
                    <span class="text--tooltip">{{ $t('myReward.claimable.ledgerS') }}</span>
                  </div>
                </q-tooltip>
              </span>
            </div>
          </div>
          <astar-button
            :width="80"
            :height="24"
            :disabled="!canClaim || !canClaimWithoutError"
            @click="claimAll"
          >
            {{ $t('myReward.claim') }}
          </astar-button>
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
          <div class="value">
            {{ isCompounding ? $t('dappStaking.on') : $t('dappStaking.off') }}
          </div>
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
    <div v-if="!canClaimWithoutError" class="claim-warning">
      <q-icon name="warning" size="20px" class="q-mr-sm" />
      <div>{{ $t('dappStaking.cantClaimWihtoutError') }}</div>
    </div>
    <div v-if="isDappDeveloper" class="info--dapps-owners">
      <span>{{ $t('new') }}</span>
      {{ $t('myReward.dappsOwners') }}
      <a
        href="https://docs.astar.network/docs/build/dapp-staking/for-devs/create-promotion/"
        target="_blank"
        rel="noopener noreferrer"
        >{{ $t('myReward.dappsOwnersLink') }}</a
      >
    </div>
  </div>
</template>
<script lang="ts">
import { estimatePendingRewards } from '@astar-network/astar-sdk-core';
import { $api } from 'src/boot/api';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { endpointKey } from 'src/config/chainEndpoints';
import { useAccount, useClaimAll, useNetworkInfo, useStakerInfo } from 'src/hooks';
import { useClaimedReward } from 'src/hooks/dapps-staking/useClaimedReward';
import { RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup() {
    const { nativeTokenSymbol, currentNetworkIdx } = useNetworkInfo();
    const { claimAll, canClaim, amountOfEras, isLoading, canClaimWithoutError, isDappDeveloper } =
      useClaimAll();
    const { totalStaked, isLoadingTotalStaked } = useStakerInfo();
    const store = useStore();

    const pendingRewards = ref<number>(0);
    const isLoadingPendingRewards = ref<boolean>(false);

    const changeDestinationForRestaking = async () => {
      const newDestination = isCompounding.value
        ? RewardDestination.FreeBalance
        : RewardDestination.StakeBalance;
      await setRewardDestination(newDestination);
    };

    const { claimed, isLoadingClaimed, isCompounding, setRewardDestination } = useClaimedReward();
    const { currentAccount, senderSs58Account } = useAccount();

    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const goToSubscan = () => {
      let rootName = 'astar';
      if (isShiden.value) {
        rootName = 'shiden';
      }
      const link = `https://${rootName}.subscan.io/account/${currentAccount.value}?tab=reward`;
      window.open(link, '_blank');
    };

    const setPendingRewards = async (): Promise<void> => {
      if (!currentAccount.value || !amountOfEras.value) {
        pendingRewards.value = 0;
        return;
      }
      isLoadingPendingRewards.value = true;
      const { stakerPendingRewards } = await estimatePendingRewards({
        api: $api!,
        walletAddress: senderSs58Account.value,
      });
      pendingRewards.value = stakerPendingRewards;
      isLoadingPendingRewards.value = false;
    };

    watch([senderSs58Account, amountOfEras], setPendingRewards, { immediate: false });

    return {
      isLoading,
      amountOfEras,
      canClaim,
      canClaimWithoutError,
      claimAll,
      isCompounding,
      changeDestinationForRestaking,
      isLoadingClaimed,
      claimed,
      totalStaked,
      nativeTokenSymbol,
      isLoadingTotalStaked,
      goToSubscan,
      pendingRewards,
      isLoadingPendingRewards,
      isDappDeveloper,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-rewards.scss';
</style>
