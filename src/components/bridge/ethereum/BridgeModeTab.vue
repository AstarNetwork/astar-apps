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
      <div class="box--history-tab">
        <div
          :class="[!isBridge ? 'selected-tab text--selected' : 'unselected-tab']"
          class="box--tab"
          @click="setIsBridge(false)"
        >
          <div v-if="isActionRequired">
            <flag-action-required class="icon" />
          </div>
          <span class="text--title-tab"> {{ $t('bridge.history') }} </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import FlagActionRequired from 'src/components/bridge/ethereum/FlagActionRequired.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { FlagActionRequired },
  props: {
    isActionRequired: {
      type: Boolean,
      required: true,
    },
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
@use 'src/components/bridge/ethereum/styles/bridge-mode-tab.scss';

.icon {
  margin-right: 8px;
}
</style>
