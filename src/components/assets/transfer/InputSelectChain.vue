<template>
  <div
    class="box--input-chain"
    :class="[!isHighlightRightUi && 'cursor-pointer box--hover--active']"
    @click="handleDisplayTokenSelector(isSelectFrom)"
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
import { defineComponent, PropType } from 'vue';

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
    isSelectFrom: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/input-select-chain.scss';
</style>
