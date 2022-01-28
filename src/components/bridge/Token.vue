<template>
  <div class="row-token" @click="selectToken(tokenObj)">
    <div class="token">
      <div>
        <img :src="logo" alt="token-icon" class="chain-logo" />
      </div>
      <div>
        <span>
          {{ tokenInfo.name }}
        </span>
      </div>
    </div>
    <div class="balance">0 {{ tokenInfo ? tokenInfo.token.symbol : '' }}</div>
  </div>
</template>

<script lang="ts">
import { getTokenInfo, PeggedPairConfig } from 'src/c-bridge';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    srcChainId: {
      type: Number,
      required: true,
    },
    tokenObj: {
      type: Object,
      required: true,
    },
    selectedToken: {
      type: Object,
      required: true,
    },
    selectToken: {
      type: Function,
      required: true,
    },
  },
  setup({ srcChainId, tokenObj }) {
    const tokenInfo = getTokenInfo({ srcChainId, selectedToken: tokenObj as PeggedPairConfig });

    const logo =
      tokenInfo.token.symbol === 'USDT'
        ? 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        : tokenInfo.icon;

    console.log('tokenInfo', tokenInfo);
    return { tokenInfo, logo };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/modal';
</style>
