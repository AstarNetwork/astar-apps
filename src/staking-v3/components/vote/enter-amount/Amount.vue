<template>
  <div class="wrapper--amount">
    <img class="token--logo" alt="token-logo" :src="nativeTokenImg" />
    <input
      :value="amount"
      inputmode="decimal"
      type="number"
      min="0"
      pattern="^[0-9]*(\.)?[0-9]*$"
      placeholder="0"
      class="input--amount input--no-spin"
      @input="handleInputAmount"
      @wheel="(e) => e.preventDefault()"
    />
    <span class="text--title">{{ nativeTokenSymbol }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  props: {
    amount: {
      type: Number,
      required: false,
      default: 0,
    },
    amountChanged: {
      type: Function as PropType<(amount: number) => void | undefined>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const { nativeTokenSymbol, nativeTokenImg } = useNetworkInfo();

    const handleInputAmount = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      if (props.amountChanged) {
        props.amountChanged(Number(target.value));
      }
    };

    return { nativeTokenImg, nativeTokenSymbol, handleInputAmount };
  },
});
</script>

<style scoped lang="scss">
.wrapper--amount {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input--amount {
  text-align: right;
  font-size: 18px;
  outline: none;
  background: transparent;
  text-align: right;
  font-weight: 600;
  color: $navy-1;
  min-width: 0;
}

.token--logo {
  width: 24px;
  height: 24px;
}

.body--dark {
  .text--title {
    color: $navy-1;
  }
}
</style>
