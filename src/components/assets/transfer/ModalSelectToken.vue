<template>
  <AstarModal
    :is-modal-open="isModalSelectToken"
    title="Select Token"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="container--select-chain-mobile">
      <div class="container--chains">
        <div
          v-for="token in tokens"
          :key="token.assetId"
          class="row--chain"
          @click="setToken(token)"
        >
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
  </AstarModal>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import AstarModal from 'src/components/common/AstarModal.vue';
import { useNetworkInfo } from 'src/hooks';
import { generateNativeAsset } from 'src/modules/xcm/tokens';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { wait } from 'src/v2/common';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: {
    AstarModal,
  },
  props: {
    isModalSelectToken: {
      type: Boolean,
      required: true,
    },
    handleModalSelectToken: {
      type: Function,
      required: true,
    },
    setToken: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectToken({ isOpen: false });
      isClosingModal.value = false;
    };

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

    return { tokens, nativeTokenSymbol, closeModal, isClosingModal };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
