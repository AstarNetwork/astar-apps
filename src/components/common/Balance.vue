<template>
  <div v-if="formattedBalance">{{ `${formattedBalance} ${unit}` }}</div>
</template>
<script lang="ts">
import { defineComponent, watch, ref, PropType } from 'vue';
import BN from 'bn.js';
import { formatBalance } from '@polkadot/util';
export default defineComponent({
  props: {
    balance: { type: Object as PropType<BN> | undefined, required: true }, //the balance should be in `femto `
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

          formattedBalance.value = formatted.split(' ').slice(0, 2).join(' ').replace('Unit', '');
        }
      },
      { immediate: true }
    );

    return { formattedBalance };
  },
});
</script>
