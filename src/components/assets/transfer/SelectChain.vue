<template>
  <div class="container--select-chain">
    <div class="row--title">
      <span>Select Chain</span>
    </div>
    <div class="container--chains">
      <div
        v-for="chain in chains"
        :key="chain.name"
        class="row--chain"
        @click="setChain(chain.name)"
      >
        <div class="column--chain-name">
          <img :src="chain.img" :alt="chain.name" class="chain-logo" />
          <span>{{ chain.name }}</span>
        </div>
        <div />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { Chain, XcmChain, xcmChains } from 'src/modules/xcm';
import { defineComponent, ref, watchEffect } from 'vue';
export default defineComponent({
  props: {
    setChain: {
      type: Function,
      required: true,
    },
  },
  setup() {
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

    return { chains };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
