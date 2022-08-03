<template>
  <div class="row--tab">
    <div class="row--mode-tab">
      <div
        :class="[isLocalTransfer ? 'selected-tab' : 'unselected-tab']"
        class="box--tab"
        @click="setIsLocalTransfer(true)"
      >
        <span :class="[isLocalTransfer && 'text--selected']"> Transfer </span>
      </div>
      <div
        :class="[!isLocalTransfer ? 'selected-tab' : 'unselected-tab']"
        class="box--tab"
        @click="setIsLocalTransfer(false)"
      >
        <span :class="[!isLocalTransfer && 'text--selected']"> Cross-chain Transfer </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isLocalTransfer: {
      type: Boolean,
      required: true,
    },
    setIsLocalTransfer: {
      type: Function,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer-mode-tab.scss';
</style>
