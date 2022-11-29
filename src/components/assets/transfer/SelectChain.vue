<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectChain') }}</span>
    </div>
    <div class="container--items">
      <div
        v-for="chain in chains"
        :key="chain.name"
        class="row--item"
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
</template>
<script lang="ts">
import { castChainName } from 'src/modules/xcm';
import { XcmChain } from 'src/v2/models';
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
