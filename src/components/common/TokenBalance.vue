<template>
  <span>
    {{
      $t(text ? text : 'amountToken', {
        amount: truncatedBalance,
        token: symbol,
      })
    }}
  </span>
</template>
<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    balance: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
      default: '',
    },
    decimals: {
      type: Number,
      required: false,
      default: 3,
    },
  },
  setup(props) {
    const { n } = useI18n();
    const truncatedBalance = ref<string>('0');
    const isTruncate = !props.symbol.toUpperCase().includes('BTC');

    if (isTruncate) {
      const truncated = truncate(props.balance, props.decimals);
      if (!Number.isNaN(truncated)) {
        truncatedBalance.value = n(truncated);
      }
    } else {
      truncatedBalance.value = props.balance;
    }

    return { truncatedBalance };
  },
});
</script>
