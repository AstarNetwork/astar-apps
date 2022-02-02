<template>
  <div
    v-if="selectedToken"
    class="remarks-container"
    :class="isDarkTheme && 'remarks-container-dark'"
  >
    <div class="remarks-left">
      <p>{{ $t('bridge.bridgeRate') }}</p>
      <p>{{ $t('bridge.fee') }}</p>
      <p>{{ $t('bridge.timeOfArrival') }}</p>
      <p>{{ $t('bridge.minAmount') }}</p>
      <p>{{ $t('bridge.maxAmount') }}</p>
    </div>
    <div class="remarks-right">
      <div class="rate">
        <p class="rate-mobile">{{ quotation ? quotation.bridge_rate : 1 }}</p>
        <div class="rate-md">
          <div class="rate-column">
            <span>{{
              $t('bridge.rateSymbol', {
                symbol: selectedToken.symbol,
                value: 1,
              })
            }}</span>
            <img
              v-if="srcChain"
              :src="srcChain.icon"
              alt="src-chain-logo"
              class="chain-logo-mini"
            />
          </div>
          <span>=</span>
          <div class="rate-column">
            <span>{{
              $t('bridge.rateSymbol', {
                symbol: selectedToken.symbol,
                value: quotation ? quotation.bridge_rate : 1,
              })
            }}</span>
            <img
              v-if="destChain"
              :src="destChain.icon"
              alt="destChain-chain-logo"
              class="chain-logo-mini"
            />
          </div>
        </div>
      </div>
      <div class="quotation-value-currency">
        <span class="quotation-value">{{
          quotation
            ? quotation.base_fee.includes('e') // eg: '1e-8' (WBTC)
              ? amount
                ? amount - Number(quotation.estimated_receive_amt)
                : 0
              : quotation.base_fee
            : 0
        }}</span>
        <span class="quotation-currency">{{ selectedToken.symbol }}</span>
      </div>
      <p class="time">{{ $t('bridge.time', { from: '5', to: '20' }) }}</p>
      <div class="quotation-value-currency">
        <span class="quotation-value">{{ quotation ? quotation.minAmount : 0 }}</span>
        <span class="quotation-currency">{{ selectedToken.symbol }}</span>
      </div>
      <div class="quotation-value-currency">
        <span class="quotation-value">{{ $n(quotation ? Number(quotation.maxAmount) : 0) }}</span>
        <span class="quotation-currency">{{ selectedToken.symbol }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: {
    quotation: {
      type: Object || null,
      required: false,
      default: null,
    },
    selectedToken: {
      type: Object || null,
      required: false,
      default: null,
    },
    srcChain: {
      type: Object || null,
      required: true,
      default: null,
    },
    destChain: {
      type: Object || null,
      required: true,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    return { isDarkTheme, isH160 };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/evm-bridge';
</style>
