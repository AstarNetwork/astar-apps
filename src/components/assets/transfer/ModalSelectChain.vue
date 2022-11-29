<template>
  <modal-wrapper
    :is-modal-open="isModalSelectChain"
    :title="$t('assets.transferPage.selectChain')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="transfer-modal"
  >
    <div class="container--select-item-mobile">
      <div class="container--items">
        <div
          v-for="chain in chains"
          :key="chain.name"
          class="row--item"
          :class="selectedChain === chain.name.toLowerCase() && 'row--item-selected'"
          @click="setChain(chain.name)"
        >
          <div class="column--item-name">
            <img :src="chain.icon" :alt="chain.name" class="item-logo" />
            <span class="text--item-name">{{ castChainName(chain.name) }}</span>
          </div>
          <div />
        </div>
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { castChainName } from 'src/modules/xcm';
import { XcmChain } from 'src/v2/models';
import { wait } from 'src/v2/common';
import { defineComponent, PropType, ref } from 'vue';
export default defineComponent({
  components: {
    ModalWrapper,
  },
  props: {
    isModalSelectChain: {
      type: Boolean,
      required: true,
    },
    handleModalSelectChain: {
      type: Function,
      required: true,
    },
    setChain: {
      type: Function,
      required: true,
    },
    selectedChain: {
      type: String,
      required: true,
    },
    chains: {
      type: Object as PropType<XcmChain[]>,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectChain({ isOpen: false });
      isClosingModal.value = false;
    };

    return { closeModal, isClosingModal, castChainName };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
