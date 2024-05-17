<template>
  <div>
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
      </div>
    </div>
    <div>
      <token-balance-native :balance="totalStakedAmount.toString()" />
      <br />
      <token-balance-native :balance="remainingLockedTokens.toString()" />
    </div>
    <div class="button-container">
      <astar-button :disabled="!canSubmit" class="submit-button">{{ $t('next') }}</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { DappVote } from '../../../logic';
import DappIcon from '../DappIcon.vue';
import Amount from './Amount.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export type ChoseAmountPanelProps = {
  dapps: DappVote[];
  onAmountChanged?: (dapp: DappVote, amount: number) => void;
  totalStakedAmount: bigint;
  remainingLockedTokens: bigint;
  canSubmit: boolean;
};

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
  },
  setup(props) {
    const handleAmountChanged = (dapp: DappVote, amount: number) => {
      if (props.onAmountChanged) {
        props.onAmountChanged(dapp, amount);
      }
    };

    return { handleAmountChanged };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/vote-common.scss';

.item-wrapper {
  padding: 16px;
  border-radius: 16px;
  background-color: $white;
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

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
