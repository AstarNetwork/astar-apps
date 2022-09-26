<template>
  <span>
    {{
      $t(text ? text : 'amountToken', {
        amount: isTruncate ? $n(truncate(balance)) : Number(balance),
        token: symbol,
      })
    }}
  </span>
</template>
<script lang="ts">
import { truncate } from 'src/hooks/helper/common';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    balance: {
      type: String || Number,
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
  },
  setup(props) {
    const isTruncate = !props.symbol.toUpperCase().includes('BTC');
    return { truncate, isTruncate };
  },
});
</script>
