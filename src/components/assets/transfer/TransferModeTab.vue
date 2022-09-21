<template>
  <div class="row--tab">
    <div class="row--mode-tab">
      <div
        :class="[isLocalTransfer ? 'selected-tab text--selected' : 'unselected-tab']"
        class="box--tab"
        @click="setIsLocalTransfer(true)"
      >
        <span class="text--title-tab"> {{ $t('assets.transfer') }} </span>
      </div>
      <div
        :class="[
          !isLocalTransfer ? 'selected-tab text--selected' : 'unselected-tab',
          isDisabledXcm && 'option--disabled',
          isDisabledXcm && 'text-color--disabled',
        ]"
        class="box--tab"
        @click="!isDisabledXcm && setIsLocalTransfer(false)"
      >
        <span class="text--title-tab"> {{ $t('assets.transferPage.crossChainTransfer') }} </span>
        <span class="text--xcm"> {{ $t('assets.transferPage.xcm') }} </span>
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
    isDisabledXcm: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer-mode-tab.scss';
</style>
