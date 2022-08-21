<template>
  <AstarModal
    :is-modal-open="isModalSelectToken"
    :title="$t('assets.transferPage.selectToken')"
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
import { wait } from 'src/v2/common';
import { Asset } from 'src/v2/models';
import { defineComponent, PropType, ref } from 'vue';

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

    return { nativeTokenSymbol, closeModal, isClosingModal };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
