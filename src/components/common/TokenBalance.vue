<template>
  <span>
    <span>
      {{
        $t(text ? text : 'amountToken', {
          amount: isTruncate ? $n(truncate(balance, decimals)) : Number(balance),
          token: symbol,
        })
      }}
    </span>
  </span>
</template>
<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { defineComponent } from 'vue';

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
    const isTruncate = !props.symbol.toUpperCase().includes('BTC');
    return { truncate, isTruncate };
  },
});
</script>
