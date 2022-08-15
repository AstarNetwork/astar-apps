<template>
  <div
    class="box--input-chain"
    :class="[!isHighlightRightUi && 'cursor-pointer box--hover--active']"
    @click="handleDisplayTokenSelector(true)"
  >
    <div class="box__space-between">
      <span> {{ $t(title) }}</span>
      <div />
    </div>
    <div class="wrapper--select-chain">
      <div class="row__chain">
        <img :src="chain.img" alt="chain-logo" class="logo" />
        <input
          :value="chain.name"
          class="input--chain text--title"
          type="text"
          spellcheck="false"
          :readonly="true"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { XcmChain } from 'src/modules/xcm';
import { computed, defineComponent, PropType, ref } from 'vue';

export default defineComponent({
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
    title: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/input-select-chain.scss';
</style>
