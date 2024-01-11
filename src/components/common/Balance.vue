<template>
  <div v-if="formattedBalance">{{ `${formattedBalance}` }}</div>
</template>
<script lang="ts">
import { defineComponent, watch, ref } from 'vue';
import { BN } from '@polkadot/util';
import { formatBalance } from '@polkadot/util';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
export default defineComponent({
  props: {
    balance: {
      type: [BN, String],
      required: true,
    }, //the balance should be in `femto `
    decimals: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  setup(props) {
    const formattedBalance = ref('');

    watch(
      () => props.balance,
      (balance) => {
        if (balance) {
          const formatted = formatBalance(props.balance, {
            withSiFull: true,
            decimals: props.decimals,
          });

          formattedBalance.value = balanceFormatter(props.balance);
        }
      },
      { immediate: true }
    );

    return { formattedBalance };
  },
});
</script>
