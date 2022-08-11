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
import { generateNativeAsset } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { defineComponent, ref, watchEffect, computed } from 'vue';
export default defineComponent({
  props: {
    setToken: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const tokens = ref<Asset[]>([]);
    const store = useStore();
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);

    const setTokens = (): void => {
      if (xcmAssets.value && nativeTokenSymbol.value) {
        const nativeToken = generateNativeAsset(nativeTokenSymbol.value);
        tokens.value = xcmAssets.value.assets.filter((it) => {
          return it.isXcmCompatible;
        });
        tokens.value.unshift(nativeToken);
      }
    };

    watchEffect(setTokens);

    return { tokens, nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
