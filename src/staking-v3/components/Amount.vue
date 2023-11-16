<template>
  <div>
    <div class="wrapper--amount">
      <img class="token--logo" alt="token-logo" :src="nativeTokenImg" />
      <span class="text--title">{{ nativeTokenSymbol }}</span>
      <input
        :value="amount"
        inputmode="decimal"
        type="number"
        min="0"
        pattern="^[0-9]*(\.)?[0-9]*$"
        placeholder="0.0"
        class="input--amount"
        @input="handleInputAmount"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { getTokenImage } from 'src/modules/token';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const amount = ref<number | undefined>(undefined);

    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );

    const handleInputAmount = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      amount.value = Number(target.value);
    };

    return { nativeTokenImg, nativeTokenSymbol, amount, handleInputAmount };
  },
});
</script>

<style scoped lang="scss">
.wrapper--amount {
  display: flex;
}

.input--amount {
  flex-grow: 1;
  text-align: right;
  font-size: 18px;
  outline: none;
  background: transparent;
  text-align: right;
  font-weight: 600;
  color: $navy-1;
}

.token--logo {
  width: 24px;
  height: 24px;
  margin-right: 8px;
}
</style>
