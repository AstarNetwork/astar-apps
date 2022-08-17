<template>
  <div class="container--select-chain">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectChain') }}</span>
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
          <span>{{ castChainName(chain.name) }}</span>
        </div>
        <div />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { castChainName, XcmChain } from 'src/modules/xcm';
import { defineComponent, PropType } from 'vue';
export default defineComponent({
  props: {
    setChain: {
      type: Function,
      required: true,
    },
    chains: {
      type: Object as PropType<XcmChain[]>,
      required: true,
    },
  },
  setup() {
    return { castChainName };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
