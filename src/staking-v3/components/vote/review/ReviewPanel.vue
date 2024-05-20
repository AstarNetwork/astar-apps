<template>
  <div class="main-container">
    <div class="panel-title">{{ $t('stakingV3.voting.review') }}</div>
    <div class="container-2-columns review-container">
      <div class="item">
        <div class="container-2-columns header">
          <div>{{ $t('stakingV3.voting.totalStakingAmount') }}</div>
          <balance-alternate-size :balance="totalStakeAmount" />
        </div>
        <div class="dapps">
          <div v-for="dapp in dapps" :key="dapp.id" class="dapp">
            <dapp-icon :icon-url="dapp.logoUrl" :alt-text="dapp.name" />
            <div>{{ dapp.name }}</div>
            <token-balance-native :balance="parseBalance(dapp.amount)" />
          </div>
        </div>
      </div>
      <div class="item">
        <div class="container-2-columns header">
          <div>{{ $t('stakingV3.voting.yourUnclaimedRewards') }}</div>
          <balance-alternate-size :balance="totalStakerRewards" />
        </div>
        <div class="container-2-columns rewards-container">
          <div class="reward">
            <div>{{ $t('stakingV3.basicRewards') }}</div>
            <token-balance-native :balance="rewards.staker.amount.toString()" />
          </div>
          <div class="reward">
            <div>{{ $t('stakingV3.bonusRewards') }}</div>
            <token-balance-native :balance="rewards.bonus.toString()" />
          </div>
        </div>
      </div>
    </div>
    <div class="button-container">
      <astar-button class="submit-button" @click="onConfirm">{{ $t('confirm') }}</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { ethers } from 'ethers';
import BalanceAlternateSize from './BalanceAlternateSize.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import DappIcon from '../DappIcon.vue';
import { useDappStaking } from 'src/staking-v3/hooks';
import { DappVote } from 'src/staking-v3/logic';

export default defineComponent({
  components: {
    BalanceAlternateSize,
    TokenBalanceNative,
    DappIcon,
  },
  props: {
    dapps: {
      type: Array as PropType<DappVote[]>,
      required: true,
    },
    totalStakeAmount: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    onConfirm: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup() {
    const { rewards, totalStakerRewards } = useDappStaking();

    const parseBalance = (balance: number): string =>
      ethers.utils.parseEther(balance.toString()).toString();

    return { rewards, totalStakerRewards, parseBalance };
  },
});
</script>

<style scoped lang="scss">
@import 'src/css/quasar.variables.scss';
@import 'src/staking-v3/components/vote/styles/vote-common.scss';

.main-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-container {
  font-weight: 600;
}

.item {
  flex: 1;
  background-color: white;
  border-radius: 16px;
  padding: 16px;
}

.header {
  justify-content: space-between;
  flex: 1;
  align-items: baseline;
  padding: 24px 0;
}

.dapps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dapp {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dapp :last-child {
  margin-left: auto;
}

.reward {
  flex: 1;
  border-radius: 16px;
  background-color: $astar-blue;
  padding: 16px;
  color: $white;
  font-size: 16px;
  text-align: right;

  > div {
    font-size: 14px;
    margin-bottom: 24px;
    text-align: left;
  }
}

.panel-title {
  padding: 16px 0;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
}
</style>
