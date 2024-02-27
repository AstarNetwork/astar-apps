<template>
  <div class="wrapper--my-staking">
    <div class="container--locked-amount">
      <div v-if="lockedButUnstaked > BigInt(0)" class="row--unstaked">
        <div class="column--info">
          <div class="column--label">
            <span>{{ $t('stakingV3.lockedAmount') }}</span>
            <button
              class="icon--tooltip"
              @click="isLockedBalloon = true"
              @mouseover="isLockedBalloon = true"
              @mouseleave="isLockedBalloon = false"
            >
              <astar-icon-help />
            </button>
            <balloon
              class="balloon--my-staking"
              direction="top"
              :is-balloon="isLockedBalloon"
              :is-balloon-closing="isBalloonClosing"
              :handle-close-balloon="closeLockedBalloon"
              :title="$t('stakingV3.lockedAmount')"
              :text="$t('stakingV3.lockedAmountTooltip')"
            />
          </div>
          <div class="column--amount">
            <token-balance-native :balance="lockedButUnstaked.toString()" />
          </div>
        </div>
        <div class="column--actions">
          <div>
            <button type="button" class="btn btn--icon icon--stake-vote" @click="navigateToVote()">
              <astar-icon-arrow-up-right />
            </button>
            <span class="text--mobile-menu">
              {{
                protocolState?.periodInfo.subperiod === PeriodType.Voting
                  ? $t('stakingV3.vote')
                  : $t('stakingV3.stake')
              }}
            </span>
            <q-tooltip>
              <span class="text--tooltip">
                {{
                  protocolState?.periodInfo.subperiod === PeriodType.Voting
                    ? $t('stakingV3.vote')
                    : $t('stakingV3.stake')
                }}
              </span>
            </q-tooltip>
          </div>
          <div>
            <button type="button" class="btn btn--icon icon--unlock" @click="handleUnlock()">
              <astar-icon-arrow-up-right />
            </button>
            <span class="text--mobile-menu">
              {{ $t('stakingV3.unlock') }}
            </span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('stakingV3.unlock') }}</span>
            </q-tooltip>
          </div>
        </div>
      </div>

      <div class="row--staked">
        <div class="column--info">
          <div class="column--label">
            <span>{{ $t('stakingV3.stakedAmount') }}</span>
            <button
              class="icon--tooltip"
              @click="isStakedBalloon = true"
              @mouseover="isStakedBalloon = true"
              @mouseleave="isStakedBalloon = false"
            >
              <astar-icon-help />
            </button>
            <balloon
              class="balloon--my-staking"
              direction="top"
              :is-balloon="isStakedBalloon"
              :is-balloon-closing="isBalloonClosing"
              :handle-close-balloon="closeStakedBalloon"
              :title="$t('stakingV3.stakedAmount')"
              :text="$t('stakingV3.stakedAmountTooltip')"
            />
          </div>
          <div class="column--amount">
            <token-balance-native :balance="totalStake.toString()" />
          </div>
        </div>
        <div class="column--actions">
          <button
            type="button"
            class="btn--check"
            :disabled="totalStake <= 0"
            @click="handleTabSelected(1)"
          >
            <template v-if="width >= screenSize.sm">{{ $t('stakingV3.check') }}</template>
            <template v-else>{{ $t('stakingV3.checkYourStaking') }}</template>
          </button>
        </div>
      </div>
    </div>

    <div class="wrapper--my-rewards">
      <div class="column--my-rewards">
        <div class="row--my-rewards-header">
          <span class="column--left">
            <span class="text--rewards">{{ $t('stakingV3.rewards') }}</span>
            <span v-if="rewards?.staker.period" class="text--period">
              {{ $t('stakingV3.period', { period: formatPeriod(rewards?.staker.period ?? 0) }) }}
            </span>
          </span>
          <span>{{ $t('stakingV3.estimatedRewards') }}</span>
        </div>
        <hr class="separator" />
        <my-staking-card
          :caption="$t('stakingV3.availableToClaim')"
          :amount="rewards?.staker.amount"
          :eras="rewards?.staker.eraCount"
          :is-tool-tip="false"
        />
        <my-staking-card
          :caption="$t('stakingV3.bonus')"
          :amount="bonus"
          :eras="bonusRewardEras"
          :is-text-bonus-eligible="isMainnet"
          :is-tool-tip="!!bonus"
          :text-tool-tip="$t('stakingV3.bonusTip')"
        />
        <button
          v-if="width <= screenSize.sm"
          class="btn--claim-mobile"
          :disabled="!hasStakerRewards && !hasBonusRewards"
          @click="claimStakerAndBonusRewards()"
        >
          {{ $t('stakingV3.claimNow') }}
        </button>
        <img
          class="bg--rewards"
          :src="require('/src/staking-v3/assets/unclaimed_rewards_bg.webp')"
          alt=""
        />
      </div>
      <button
        v-if="width >= screenSize.sm"
        class="btn--claim"
        :disabled="!hasStakerRewards && !hasBonusRewards"
        @click="claimStakerAndBonusRewards()"
      >
        <span class="text--label">{{ $t('stakingV3.claimEstimatedRewards') }}</span>
        <span class="text--balance">
          <span class="text--amount">
            {{ $n(truncate(ethers.utils.formatEther(totalStakerRewards.toString()) ?? '0', 2)) }}
          </span>
          <div class="text--symbol">{{ nativeTokenSymbol }}</div>
        </span>
      </button>
    </div>
    <modal-unlock-tokens
      v-if="lockedButUnstaked > BigInt(0)"
      :show="showUnlockModal"
      :set-is-open="setShowUnlockModal"
      :max-unlock-amount="lockedButUnstaked"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref, watch } from 'vue';
import { useAprV3, useDappStaking, useDappStakingNavigation } from '../../hooks';
import MyStakingCard from './MyStakingCard.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { PeriodType } from 'src/staking-v3/logic';
import { ethers } from 'ethers';
import { useNetworkInfo, useBreakpoints } from 'src/hooks';
import { truncate } from '@astar-network/astar-sdk-core';
import Balloon from 'src/components/common/Balloon.vue';
import ModalUnlockTokens from './ModalUnlockTokens.vue';

export default defineComponent({
  components: {
    MyStakingCard,
    TokenBalanceNative,
    Balloon,
    ModalUnlockTokens,
  },
  props: {
    tabSelected: {
      type: Function as PropType<(index: number) => void> | undefined,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const {
      rewards,
      hasStakerRewards,
      hasBonusRewards,
      totalStakerRewards,
      ledger,
      totalStake,
      protocolState,
      eraLengths,
      claimStakerAndBonusRewards,
      formatPeriod,
    } = useDappStaking();

    const bonus = ref<BigInt>(BigInt(0));
    const { getEstimatedBonus } = useAprV3({ isWatch: false });

    const { navigateToVote } = useDappStakingNavigation();

    const lockedButUnstaked = computed<bigint>(() => {
      return ledger.value ? ledger.value.locked - totalStake.value : BigInt(0);
    });

    const selectedTabIndex = ref<number>(0);
    const bonusRewardEras = computed<number>(() => {
      return rewards.value.bonus > 0 ? eraLengths.value.standardErasPerBuildAndEarnPeriod : 0;
    });

    const handleTabSelected = (index: number) => {
      selectedTabIndex.value = index;
      if (props.tabSelected) {
        props.tabSelected(index);
      }
    };

    const { nativeTokenSymbol, isMainnet } = useNetworkInfo();

    const setBonus = async (): Promise<void> => {
      if (rewards.value?.bonus > 0) {
        bonus.value = rewards.value?.bonus;
      } else {
        const amount = String(await getEstimatedBonus());
        bonus.value = BigInt(String(ethers.utils.parseEther(amount)));
      }
    };

    const isLockedBalloon = ref<boolean>(false);
    const isStakedBalloon = ref<boolean>(false);
    const isBalloonClosing = ref<boolean>(false);

    const closeLockedBalloon = () => {
      isLockedBalloon.value = false;
    };
    const closeStakedBalloon = () => {
      isStakedBalloon.value = false;
    };

    const { width, screenSize } = useBreakpoints();

    const showUnlockModal = ref<boolean>(false);

    const setShowUnlockModal = (isOpen: boolean): void => {
      showUnlockModal.value = isOpen;
    };

    const handleUnlock = (): void => {
      setShowUnlockModal(true);
    };

    watch([rewards], setBonus);

    return {
      rewards,
      totalStakerRewards,
      hasStakerRewards,
      hasBonusRewards,
      lockedButUnstaked,
      totalStake,
      protocolState,
      ethers,
      nativeTokenSymbol,
      isLockedBalloon,
      isStakedBalloon,
      isBalloonClosing,
      width,
      screenSize,
      bonusRewardEras,
      showUnlockModal,
      closeLockedBalloon,
      closeStakedBalloon,
      truncate,
      claimStakerAndBonusRewards,
      navigateToVote,
      handleTabSelected,
      formatPeriod,
      setShowUnlockModal,
      handleUnlock,
      PeriodType,
      bonus,
      isMainnet,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--my-staking {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 -16px;
  @media (min-width: $sm) {
    margin: 0;
  }
}

.container--locked-amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media (min-width: $sm) {
    gap: 0;
  }
}

.row--unstaked,
.row--staked {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  background-color: $gray-1;
  transition: all 0.2s ease;
  padding: 24px 16px;
  flex-direction: column;
  gap: 32px;
  @media (min-width: $sm) {
    gap: 16px;
    padding: 8px 16px;
    flex-direction: row;
    background-color: transparent;
    &:hover {
      background-color: $gray-1;
    }
  }
}

.column--info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: row;
  justify-content: space-between;
  @media (min-width: $sm) {
    width: 50%;
  }
}

.column--actions {
  justify-content: center;
  display: flex;
  gap: 20px;
  @media (min-width: $sm) {
    gap: 16px;
    width: 50%;
    justify-content: flex-end;
  }
}

.text--mobile-menu {
  font-size: 12px;
  color: $gray-3;
  font-weight: 500;
  display: block;
  text-align: center;
  margin-top: 10px;
  @media (min-width: $sm) {
    display: none;
  }
}

.column--label {
  position: relative;
  display: flex;
  align-items: center;
}

.column--label,
.column--amount {
  width: 50%;
}

.column--amount {
  text-align: right;
}

.btn--icon {
  display: flex;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background-color: $astar-blue;
  margin: auto;
  @media (min-width: $sm) {
    background-color: transparent;
    color: $astar-blue;
    margin: auto;
    svg {
      width: 24px;
      height: 24px;
    }
    &:hover {
      color: white;
      background-color: $astar-blue;
    }
  }
  &.icon--stake-vote svg {
    transform: rotate(135deg);
  }
  &.icon--unlock svg {
    transform: rotate(-45deg);
  }
}

.btn--check {
  color: $astar-blue;
  transition: all 0.2s ease;
  border-radius: 9999px;
  padding: 8px;
  @media (min-width: $sm) {
    width: 96px;
  }
}

.btn--check[disabled] {
  color: $gray-3;
}
.btn--check:not([disabled]):hover {
  background-color: $astar-blue;
  color: white;
}

.wrapper--my-rewards {
  display: flex;
  gap: 24px;
}

.column--my-rewards {
  background: linear-gradient(0deg, #0ae2ff -1.31%, #0297fb 63.05%);
  color: white;
  padding: 24px 16px;
  gap: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  position: relative;
  @media (min-width: $sm) {
    border-radius: 16px;
    padding: 24px;
  }
  .separator {
    border-bottom: solid 1-x $gray-2;
    height: 1px;
  }
}

.btn--claim {
  color: white;
  display: flex;
  width: 214px;
  padding: 40px 32px;
  flex-direction: column;
  gap: 12px;
  border-radius: 16px;
  background: linear-gradient(101deg, #0297fb 50.27%, #0070eb 88.26%, #0ae2ff 173.42%);
  line-height: 1.25;
  transition: all 0.2s ease;
  &:hover {
    filter: brightness(1.2);
  }
  .text--label {
    font-size: 16px;
    font-weight: 700;
    color: white;
    text-align: left;
  }
  .text--balance {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 8px;
  }
  .text--amount {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .text--symbol {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 2px;
  }
}

.btn--claim-mobile {
  padding: 8px;
  border-radius: 9999px;
  background: linear-gradient(101deg, #0297fb 50.27%, #0070eb 88.26%, #0ae2ff 173.42%);
  z-index: 1;
  font-weight: 700;
  position: relative;
}

.balloon--my-staking {
  width: 280px;
  margin-top: -10px;
  z-index: 9999;
}

.icon--tooltip {
  display: block;
  padding: 4px;
  line-height: 0;
  svg {
    pointer-events: none;
    width: 16px;
    height: 16px;
  }
  &:hover {
    color: $astar-blue;
  }
}

.row--my-rewards-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  .column--left {
    font-weight: 600;
    display: flex;
    gap: 10px;
  }
  .column--right {
    font-weight: 500;
  }
  .text--rewards {
    font-weight: 700;
    text-transform: uppercase;
  }
  .text--period {
    display: none;
    @media (min-width: $sm) {
      display: inline;
    }
  }
}

.bg--rewards {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  mix-blend-mode: color-burn;
  z-index: 0;
}

.body--dark {
  .row--unstaked,
  .row--staked {
    background-color: $navy-3;
    @media (min-width: $sm) {
      background-color: transparent;
      &:hover {
        background-color: $navy-3;
      }
    }
  }
}
</style>
