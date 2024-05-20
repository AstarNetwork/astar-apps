<template>
  <div class="choose-amount-container">
    <div class="panel-title">{{ $t('stakingV3.voting.addAmounts') }}</div>
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
          <div>{{ $t('stakingV3.voting.availableAfterStaking') }}</div>
          <token-balance-native :balance="stakeInfo.availableAfterStaking.toString()" />
        </div>
        <div v-if="stakeInfo.remainingLockedTokens > BigInt(0)" class="remaining-balance">
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

// export type ChoseAmountPanelProps = {
//   dapps: DappVote[];
//   totalStakedAmount: bigint;
//   remainingLockedTokens: bigint;
//   canSubmit: boolean;
//   onAmountChanged?: (dapp: DappVote, amount: number) => void;
//   onContinue: () => void;
// };

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
@import 'src/staking-v3/components/vote/styles/vote-common.scss';

.panel-title {
  padding: 16px 0;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
}

.item-wrapper {
  padding: 16px;
  border-radius: 16px;
  background-color: $white;
  position: relative;
}

.item-wrapper:hover .remove {
  visibility: visible;
  opacity: 0.5;
  transition: opacity 0.5s ease-in-out;
}

.remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
  border: 1px solid $gray-3;
  font-color: $gray-2;
  margin-top: 8px;
  margin-right: 8px;
  cursor: pointer;
  visibility: visible;
  opacity: 0.5;
  transition: opacity 0.5s ease-in-out;

  @media (min-width: 768px) {
    opacity: 0;
    visibility: hidden;
  }
}

.amount {
  display: flex;
  padding: 24px 24px 24px 18px;
  border-radius: 16px;
  background-color: $gray-1;
}

.name-and-icon {
  display: flex;
  gap: 16px;
  align-items: center;
  font-weight: 600;
  padding: 16px 16px 16px 8px;
}

.amount {
  flex: 1;
}

.staking-balances {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  background-color: $white;

  span {
    font-weight: 600;
    font-size: 16px;
    text-align: right;
  }
}

.remaining-balance {
  border-radius: 8px;
  padding: 16px;
  border: 1px solid $astar-pink-1;
  margin-top: 16px;

  .pink {
    color: $astar-pink-1;
  }

  .vote {
    font-size: 13px;
    margin-top: 16px;
  }
}

.choose-amount-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: -8px;

  @media (min-width: 768px) {
    margin: 0px;
  }
}

.container-2-columns {
  div {
    flex: 1;
  }

  flex: {
    span: 1;
  }
}
</style>
