<template>
  <div
    class="box--input-chain"
    :class="[!isHighlightRightUi && isSelectable && 'cursor-pointer box--hover--active']"
    @click="isSelectable && handleDisplayTokenSelector(isSelectFrom)"
  >
    <div class="box__space-between">
      <span> {{ $t(title) }}</span>
      <div>
        <span class="text--to--balance">
          <TokenBalance text="assets.modals.balance" :balance="balance" :symbol="symbol" />
        </span>
      </div>
    </div>
    <div v-if="chain" class="wrapper--select-chain">
      <div class="row__chain">
        <img :src="chain.img" alt="chain-logo" class="logo" />
        <input
          :value="castChainName(chain.name)"
          class="input--chain text--title"
          type="text"
          spellcheck="false"
          :readonly="true"
        />
      </div>
      <div v-if="isSelectable" class="icon--expand">
        <astar-icon-expand size="20" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { XcmChain } from 'src/v2/models';
import { defineComponent, PropType } from 'vue';
import { castChainName } from 'src/modules/xcm';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: { TokenBalance },
  props: {
    chain: {
      type: Object as PropType<XcmChain>,
      required: true,
    },
    handleDisplayTokenSelector: {
      type: Function,
      required: true,
    },
    isHighlightRightUi: {
      type: Boolean,
      required: true,
    },
    isSelectFrom: {
      type: Boolean,
      required: true,
    },
    isSelectable: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    balance: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
  },
  setup() {
    return { castChainName };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/input-select-chain.scss';
</style>
