<template>
  <div class="card">
    <div class="card--title">{{ caption }}</div>
    <div class="card--balance">
      <div class="card--amount">{{ ethers.utils.formatEther(amount) }}</div>
      <div class="card--symbol">{{ nativeTokenSymbol }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ethers } from 'ethers';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  props: {
    caption: {
      type: String,
      required: true,
    },
    amount: {
      type: [BigInt, undefined],
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();

    return { nativeTokenSymbol, ethers };
  },
});
</script>

<style lang="scss" scoped>
.card {
  border-radius: 16px;
  background: rgba(63, 197, 251, 0.3);
  padding: 16px 24px;
}

.card--title {
  font-size: 15px;
  font-weight: 800;
  line-height: normal;
}

.card--balance {
  display: flex;
  align-items: flex-end;
}

.card--amount {
  font-size: 16px;
  font-weight: 700;
  line-height: normal;
}

.card--symbol {
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  padding: 0px 8px;
}
</style>
