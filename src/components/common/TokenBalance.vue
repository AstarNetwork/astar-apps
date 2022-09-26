<template>
  <span>
    {{
      $t(text ? text : 'amountToken', {
        amount: isFullDecimals ? Number(balance) : $n(truncate(balance)),
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
    const isFullDecimals = props.symbol.toUpperCase().includes('BTC');
    return { truncate, isFullDecimals };
  },
});
</script>
