<template>
  <div class="choose-amount-container">
    <div class="panel-title">{{ $t('stakingV3.voting.addAmounts') }}</div>
    <voting-note />
    <div class="vote-common-container">
      <div v-for="dapp of dapps" :key="`dapp-${dapp.id}`" class="item-wrapper">
        <div class="name-and-icon">
          <dapp-icon :icon-url="dapp.logoUrl" :alt-text="dapp.name" />
          {{ dapp.name }}
        </div>
        <div class="amount">
          <amount
            :amount="dapp.amount"
            :amount-changed="(amount) => handleAmountChanged(dapp, amount)"
          />
        </div>
        <div v-if="dapps.length > 1" class="remove" @click="handleRemoveDapp(dapp)">
          <astar-icon-close />
        </div>
      </div>
    </div>
    <div class="container-2-columns">
      <div class="staking-balances">
        <div class="container-2-columns">
          <div v-if="isMove">{{ $t('stakingV3.voting.remainingAmountAfterMoving') }}</div>
          <div v-else>{{ $t('stakingV3.voting.availableAfterStaking') }}</div>
          <token-balance-native :balance="stakeInfo.availableAfterStaking.toString()" />
        </div>
        <div
          v-if="stakeInfo.remainingLockedTokens > BigInt(0) && !isMove"
          class="remaining-balance"
        >
          <div class="container-2-columns pink">
            <div>{{ $t('stakingV3.remainingLockedBalance') }}</div>
            <token-balance-native :balance="stakeInfo.remainingLockedTokens.toString()" />
          </div>
          <div class="vote">
            {{ $t('stakingV3.voting.beSureToVote') }}
          </div>
        </div>
      </div>
      <div class="container-2-columns staking-balances">
        <div>{{ $t('stakingV3.voting.totalStakingAmount') }}</div>
        <token-balance-native :balance="stakeInfo.totalStakedAmount.toString()" />
      </div>
    </div>
    <error-panel :error-message="stakeInfo.errorMessage" :error-ref-url="stakeInfo.errorRefUrl" />
    <div class="button-container">
      <go-back-button v-if="onGoBack" @click="onGoBack && onGoBack()">{{
        $t('stakingV3.voting.backToCategory')
      }}</go-back-button>
      <astar-button :disabled="!canSubmit()" class="submit-button" @click="onAmountsEntered">{{
        $t('next')
      }}</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DappVote } from '../../../logic';
import DappIcon from '../DappIcon.vue';
import Amount from './Amount.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import ErrorPanel from '../../ErrorPanel.vue';
import GoBackButton from '../GoBackButton.vue';
import VotingNote from '../VotingNote.vue';

export type StakeInfo = {
  totalStakedAmount: bigint;
  remainingLockedTokens: bigint;
  availableAfterStaking: bigint;
  errorMessage: string;
  errorRefUrl: string;
};

export default defineComponent({
  components: {
    DappIcon,
    Amount,
    TokenBalanceNative,
    ErrorPanel,
    GoBackButton,
    VotingNote,
  },
  props: {
    dapps: {
      type: Array as PropType<DappVote[]>,
      required: true,
    },
    onAmountChanged: {
      type: Function as PropType<(dapp: DappVote, amount: number) => void>,
      required: false,
      default: undefined,
    },
    stakeInfo: {
      type: Object as PropType<StakeInfo>,
      required: true,
    },
    canSubmit: {
      type: Function as PropType<() => boolean>,
      required: true,
    },
    onAmountsEntered: {
      type: Function as PropType<() => void>,
      required: true,
    },
    onRemoveDapp: {
      type: Function as PropType<(dapp: DappVote) => void>,
      required: false,
      default: undefined,
    },
    onGoBack: {
      type: Function as PropType<() => void>,
      required: false,
      default: undefined,
    },
    isMove: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const handleAmountChanged = (dapp: DappVote, amount: number) => {
      if (props.onAmountChanged) {
        props.onAmountChanged(dapp, amount);
      }
    };

    const handleRemoveDapp = (dapp: DappVote) => {
      if (props.onRemoveDapp) {
        props.onRemoveDapp(dapp);
      }
    };

    return { handleAmountChanged, handleRemoveDapp };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/choose-amounts.scss';
</style>
