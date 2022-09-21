<template>
  <div class="row--tab">
    <div class="row--mode-tab">
      <div
        :class="[isEdit ? 'selected-tab text--selected' : 'unselected-tab']"
        class="box--tab"
        @click="setIsEdit(true)"
      >
        <span class="text--title-tab"> {{ $t('dappStaking.modals.markdown') }} </span>
      </div>
      <div
        :class="[!isEdit ? 'selected-tab text--selected' : 'unselected-tab']"
        class="box--tab"
        @click="setIsEdit (false)"
      >
        <span class="text--title-tab"> {{ $t('dappStaking.modals.preview') }} </span>
        <span class="text--xcm"> {{ $t('assets.transferPage.xcm') }} </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isEdit: {
      type: Boolean,
      required: true,
    },
    setIsEdit: {
      type: Function,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer-mode-tab.scss';
</style>
