<template>
  <div>
    <div class="box--input">
      <div class="box__space-between">
        <span> {{ $t('common.speed.speed') }}</span>
        <div />
      </div>
      <div class="box__row">
        <div class="column--gas-option" @click="selectedGasSpeed('slow')">
          <span class="text--accent">{{ $t('common.speed.average') }}</span>
          <span class="text--gas-price">0.002 ASTR</span>
        </div>
        <div class="column--gas-option" @click="selectedGasSpeed('average')">
          <span class="text--accent">{{ $t('common.speed.fast') }}</span>
          <span class="text--gas-price">0.002 ASTR</span>
        </div>
        <div class="column--gas-option" @click="selectedGasSpeed('fast')">
          <span class="text--accent">{{ $t('common.speed.superFast') }}</span>
          <span class="text--gas-price">0.002 ASTR</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    evmGasPrice: {
      type: Object,
      required: true,
    },
    selectedGasSpeed: {
      type: String,
      required: true,
    },
    setSelectedGasSpeed: {
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
@use 'src/components/common/styles/speed-meter.scss';
</style>
