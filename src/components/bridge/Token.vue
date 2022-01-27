<template>
  <div class="row-token" @click="selectToken(tokenObj)">
    <div class="token">
      <div>
        <img :src="logo" alt="token-icon" class="chain-logo" />
      </div>
      <div>
        <span>
          {{ token.name }}
        </span>
      </div>
    </div>
    <div class="balance">0 MATIC</div>
  </div>
</template>

<script lang="ts">
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
    const token = srcChainId === tokenObj.org_chain_id ? tokenObj.org_token : tokenObj.pegged_token;

    const logo =
      token.token.symbol === 'USDT'
        ? 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        : token.icon;

    console.log('token', token);
    return { token, logo };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/modal';
</style>
