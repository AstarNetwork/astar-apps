<template>
  <div class="row--tab">
    <div class="row--mode-tab">
      <div
        :class="[isNetwork ? 'selected-tab' : 'unselected-tab']"
        class="box--tab"
        @click="setIsNetwork(true)"
      >
        <span :class="isNetwork ? 'text--title-tab-selected' : 'text--title-tab'">
          {{ $t('drawer.network') }}
        </span>
      </div>
      <div class="box--history-tab">
        <div
          :class="[!isNetwork ? 'selected-tab' : 'unselected-tab']"
          class="box--tab"
          data-testid="select-wallet-tab"
          @click="setIsNetwork(false)"
        >
          <span :class="!isNetwork ? 'text--title-tab-selected' : 'text--title-tab'">
            {{ $t('drawer.wallet') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isNetwork: {
      type: Boolean,
      required: true,
    },
    setIsNetwork: {
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
@use 'src/components/header/styles/network-wallet-tab.scss';
</style>
