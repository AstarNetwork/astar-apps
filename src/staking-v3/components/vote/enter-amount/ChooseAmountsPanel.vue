<template>
  <div>
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
    <div>
      <token-balance-native :balance="totalStakedAmount.toString()" />
      <br />
      <token-balance-native :balance="remainingLockedTokens.toString()" />
    </div>
    <div class="button-container">
      <astar-button :disabled="!canSubmit" class="submit-button" @click="onAmountsEntered">{{
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

// export type ChoseAmountPanelProps = {
//   dapps: DappVote[];
//   totalStakedAmount: bigint;
//   remainingLockedTokens: bigint;
//   canSubmit: boolean;
//   onAmountChanged?: (dapp: DappVote, amount: number) => void;
//   onContinue: () => void;
// };

export default defineComponent({
  components: {
    DappIcon,
    Amount,
    TokenBalanceNative,
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
    totalStakedAmount: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    remainingLockedTokens: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    canSubmit: {
      type: Boolean as PropType<boolean>,
      required: false,
      default: false,
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
  },
  setup(props) {
    const handleAmountChanged = (dapp: DappVote, amount: number) => {
      if (props.onAmountChanged) {
        props.onAmountChanged(dapp, amount);
      }
    };

    const handleRemoveDapp = (dapp: DappVote) => {
      console.log('remove dapp', dapp);
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
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
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
</style>
