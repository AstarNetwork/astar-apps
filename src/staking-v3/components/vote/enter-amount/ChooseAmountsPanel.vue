<template>
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Dapp } from '../types';
import DappIcon from '../DappIcon.vue';
import Amount from './Amount.vue';

export default defineComponent({
  components: {
    DappIcon,
    Amount,
  },
  props: {
    dapps: {
      type: Array as PropType<Dapp[]>,
      required: true,
    },
    onAmountChanged: {
      type: Function as PropType<(dapp: Dapp, amount: number) => void>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const handleAmountChanged = (dapp: Dapp, amount: number) => {
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
</style>
