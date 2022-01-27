<template>
  <div @click="selectToken(tokenObj)">
    {{ token.name }}
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
    console.log('token', token);
    return { token };
  },
});
</script>

<style lang="scss" scoped></style>
