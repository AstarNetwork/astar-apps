<template>
  <AstarModal
    :is-modal-open="isModalSelectToken"
    :title="$t('assets.transferPage.selectToken')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="transfer-modal"
  >
    <div class="container--select-item-mobile">
      <div class="container--items">
        <div
          v-for="t in tokens"
          :key="t.assetId"
          class="row--item"
          :class="token.metadata.symbol === t.metadata.symbol && 'row--item-selected'"
          @click="setToken(t)"
        >
          <div class="column--item-name">
            <img
              :src="t.tokenImage"
              :alt="t.metadata.symbol"
              :class="[t.metadata.symbol === nativeTokenSymbol ? 'native-token-logo' : 'item-logo']"
            />
            <span>{{ t.metadata.symbol }}</span>
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
import { wait } from 'src/v2/common';
import { Asset } from 'src/v2/models';
import { defineComponent, PropType, ref, watchEffect } from 'vue';

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
    tokens: {
      type: Object as PropType<Asset[]>,
      required: true,
    },
    token: {
      type: Object as PropType<Asset>,
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

    watchEffect(() => {
      console.log('tokens', props.tokens);
    });

    return { nativeTokenSymbol, closeModal, isClosingModal };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
