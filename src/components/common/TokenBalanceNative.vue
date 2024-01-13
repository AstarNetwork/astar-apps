<template>
  <token-balance
    :balance="ethers.utils.formatEther(balance)"
    :text="text"
    :decimals="decimals"
    :symbol="showTokenSymbol ? nativeTokenSymbol : ''"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ethers } from 'ethers';
import TokenBalance from './TokenBalance.vue';
import { useNetworkInfo } from 'src/hooks';

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
      default: '',
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
    const { nativeTokenSymbol } = useNetworkInfo();

    return { nativeTokenSymbol, ethers };
  },
});
</script>
