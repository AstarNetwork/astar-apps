<template>
  <AstarModal
    :is-modal-open="isModalSelectChain"
    title="Select Chain"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
  >
    <div class="container--select-chain-mobile">
      <div class="container--chains">
        <div v-for="chain in chains" :key="chain.name" class="row--chain">
          <div class="column--chain-name">
            <img :src="chain.img" :alt="chain.name" class="chain-logo" />
            <span>{{ chain.name }}</span>
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
import { defineComponent, ref, watchEffect, computed } from 'vue';
import AstarModal from 'src/components/common/AstarModal.vue';
import { wait } from 'src/v2/common';
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
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectChain({ isOpen: false });
      isClosingModal.value = false;
    };

    const { currentNetworkIdx } = useNetworkInfo();
    const chains = ref<XcmChain[]>([]);

    const setChains = (): void => {
      const relayChainId =
        currentNetworkIdx.value === endpointKey.ASTAR ? Chain.POLKADOT : Chain.KUSAMA;
      const disabledChain = [Chain.MOONBEAM];
      const selectableChains = xcmChains.filter((it) => {
        return it.relayChain === relayChainId && !disabledChain.includes(it.name);
      });
      chains.value = selectableChains;
    };

    watchEffect(setChains);

    return { chains, closeModal, isClosingModal };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
