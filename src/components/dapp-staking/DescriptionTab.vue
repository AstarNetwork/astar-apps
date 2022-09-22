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
        @click="setIsEdit(false)"
      >
        <span class="text--title-tab"> {{ $t('dappStaking.modals.preview') }} </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs } from 'vue';

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
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer-mode-tab.scss';
</style>
