<template>
  <div class="row--tab">
    <div class="row--mode-tab">
      <div
        :class="[isBridge ? 'selected-tab text--selected' : 'unselected-tab']"
        class="box--tab"
        @click="setIsBridge(true)"
      >
        <span class="text--title-tab"> {{ $t('bridge.bridge') }} </span>
      </div>
      <div @click="setIsBridge(false)">
        <div
          :class="[!isBridge ? 'selected-tab text--selected' : 'unselected-tab']"
          class="box--tab"
        >
          <span class="text--title-tab"> {{ $t('bridge.history') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    isBridge: {
      type: Boolean,
      required: true,
    },
    setIsBridge: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/l1/styles/bridge-mode-tab.scss';
</style>
