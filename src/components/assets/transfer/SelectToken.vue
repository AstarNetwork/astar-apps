<template>
  <div class="container--select-chain">
    <div class="row--title">
      <span>Select Token</span>
    </div>
    <div class="container--chains">
      <div v-for="token in tokens" :key="token.assetId" class="row--chain" @click="setToken(token)">
        <div class="column--chain-name">
          <img
            :src="token.tokenImage"
            :alt="token.metadata.symbol"
            :class="[
              token.metadata.symbol === nativeTokenSymbol ? 'native-token-logo' : 'chain-logo',
            ]"
          />
          <span>{{ token.metadata.symbol }}</span>
        </div>
        <div />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { Asset } from 'src/v2/models';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    setToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<Asset[]>,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    return { nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
