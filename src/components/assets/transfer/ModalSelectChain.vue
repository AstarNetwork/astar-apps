<template>
  <AstarModal
    :is-modal-open="isModalSelectChain"
    :title="$t('assets.transferPage.selectChain')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="container--select-chain-mobile">
      <div class="container--chains">
        <div
          v-for="chain in chains"
          :key="chain.name"
          class="row--chain"
          @click="setChain(chain.name)"
        >
          <div class="column--chain-name">
            <img :src="chain.img" :alt="chain.name" class="chain-logo" />
            <span>{{ castChainName(chain.name) }}</span>
          </div>
          <div />
        </div>
      </div>
    </div>
  </AstarModal>
</template>
<script lang="ts">
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { fadeDuration } from '@astar-network/astar-ui';
import { Chain, XcmChain, xcmChains } from 'src/modules/xcm';
import { defineComponent, ref, watchEffect, PropType } from 'vue';
import AstarModal from 'src/components/common/AstarModal.vue';
import { wait } from 'src/v2/common';
import { castChainName } from 'src/modules/xcm';
export default defineComponent({
  components: {
    AstarModal,
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
