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
            >{{ $t('myReward.claim') }}</astar-button
          >
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
            >{{ $t('myReward.claim') }}</astar-button
          >
        </div>
      </div>
      <div class="card">
        <div class="row--title">
          <span class="pill-box">New</span>
          {{ $t('myReward.compound') }}
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
          <astar-button :disabled="isH160" :width="80" :height="24" @click="showAutoCompound">
            {{ $t('dappStaking.change') }}
          </astar-button>
          <astar-button
            :disabled="isH160"
            :width="80"
            :height="24"
            @click="changeDestinationForRestaking"
          >
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
    <modal-auto-compound
      v-model:is-open="showAutoCompoundModal"
      :show="showAutoCompoundModal"
      @confirm="handleModalConfirm"
    />
  </div>
</template>
<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { useAccount, useClaimAll, useNetworkInfo, useStakerInfo, useAutoCompound } from 'src/hooks';
import { useClaimedReward } from 'src/hooks/dapps-staking/useClaimedReward';
import ModalAutoCompound from 'src/components/dapp-staking/my-staking/components/modals/ModalAutoCompound.vue';
import { RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';
import { endpointKey } from 'src/config/chainEndpoints';
import { defineComponent, computed, ref, watch } from 'vue';
import { useStore } from 'src/store';
import { $api } from 'src/boot/api';
import { estimatePendingRewards } from '@astar-network/astar-sdk-core';

export default defineComponent({
  components: {
    TokenBalance,
    ModalAutoCompound,
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const { claimAll, canClaim, amountOfEras, isLoading, canClaimWithoutError, isDappDeveloper } =
      useClaimAll();
    const { totalStaked, isLoadingTotalStaked } = useStakerInfo();
    const { compoundAll } = useAutoCompound();
    const showAutoCompoundModal = ref<boolean>(false);
    const showAutoCompound = (): void => {
      showAutoCompoundModal.value = true;
    };

    const pendingRewards = ref<number>(0);
    const isLoadingPendingRewards = ref<boolean>(false);

    const changeDestinationForRestaking = async () => {
      const newDestination = isCompounding.value
        ? RewardDestination.FreeBalance
        : RewardDestination.StakeBalance;
      await setRewardDestination(newDestination);
    };

    const handleModalConfirm = async (event: string) => {
      if (event === 'auto') {
        await compoundAll();
      }

      if (event === 'stake') {
        await setRewardDestination(RewardDestination.StakeBalance);
      }

      if (event === 'free') {
        await setRewardDestination(RewardDestination.FreeBalance);
      }
    };

    const { claimed, isLoadingClaimed, isCompounding, setRewardDestination } = useClaimedReward();
    const { currentAccount } = useAccount();
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
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
        walletAddress: currentAccount.value,
      });
      pendingRewards.value = stakerPendingRewards;
      isLoadingPendingRewards.value = false;
    };

    watch([currentAccount, amountOfEras], setPendingRewards, { immediate: false });

    return {
      isLoading,
      amountOfEras,
      canClaim,
      canClaimWithoutError,
      claimAll,
      isCompounding,
      handleModalConfirm,
      changeDestinationForRestaking,
      isLoadingClaimed,
      claimed,
      totalStaked,
      nativeTokenSymbol,
      isLoadingTotalStaked,
      goToSubscan,
      showAutoCompound,
      showAutoCompoundModal,
      isH160,
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
