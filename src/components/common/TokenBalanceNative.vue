<template>
  <token-balance
    :balance="formatEtherAsString(balance)"
    :text="text"
    :decimals="decimals"
    :symbol="showTokenSymbol ? dappStakingCurrency : ''"
  />
</template>

<script lang="ts">
import { useNetworkInfo } from "src/hooks";
import { formatEtherAsString } from "src/lib/formatters";
import { defineComponent } from "vue";
import TokenBalance from "./TokenBalance.vue";

export default defineComponent({
  components: {
    TokenBalance,
  },
  props: {
    balance: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
      default: "",
    },
    decimals: {
      type: Number,
      required: false,
      default: 3,
    },
    showTokenSymbol: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup() {
    const { dappStakingCurrency } = useNetworkInfo();

    return { dappStakingCurrency, formatEtherAsString };
  },
});
</script>
