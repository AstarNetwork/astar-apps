<!-- Displays token balance with different size between amount and the token symbol. -->
<template>
  <div class="balance-alternate-size">
    <div class="amount">
      <token-balance-native :balance="balance.toString()" :show-token-symbol="false" />
    </div>
    <div class="token-symbol">{{ tokenSymbolToDisplay }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    balance: {
      type: BigInt as unknown as PropType<bigint>,
      required: true,
    },
    tokenSymbol: {
      type: String as PropType<string>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const { dappStakingCurrency } = useNetworkInfo();
    const tokenSymbolToDisplay = computed(() => props.tokenSymbol ?? dappStakingCurrency.value);

    return { tokenSymbolToDisplay };
  },
});
</script>

<style scoped lang="scss">
.balance-alternate-size {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.amount {
  font-size: 24px;
  font-weight: 700;
}

.token-symbol {
  font-size: 16px;
}
</style>
