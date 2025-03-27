<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectChain') }}</span>
    </div>
    <div class="container--items">
      <div v-for="chain in chains" :key="chain" class="row--item" @click="setChain(chain)">
        <div class="column--item-name">
          <img :src="ccipBridgeIcon[chain]" :alt="chain" class="item-logo" />
          <span class="text--item-name">{{ chain }}</span>
        </div>
        <div />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { CcipNetworkName, ccipBridgeIcon } from 'src/modules/ccip-bridge';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    setChain: {
      type: Function,
      required: true,
    },
    chains: {
      type: Object as PropType<CcipNetworkName[]>,
      required: true,
    },
  },
  setup() {
    return { ccipBridgeIcon };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
