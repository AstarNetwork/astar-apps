<template>
  <div>
    <div class="box--input">
      <div class="box__space-between">
        <span> {{ $t('common.speed.speed') }}</span>
        <div />
      </div>
      <div class="box__row">
        <div
          class="column--gas-option"
          :class="selectedGas.speed === 'slow' && 'selected-gas-option'"
          @click="setSelectedGas('slow')"
        >
          <span class="text--accent">{{ $t('common.speed.average') }}</span>
          <span class="text--gas-price">{{ Number(gasCost.slow.toFixed(5)) }} {{ symbol }}</span>
        </div>

        <div
          class="column--gas-option"
          :class="selectedGas.speed === 'average' && 'selected-gas-option'"
          @click="setSelectedGas('average')"
        >
          <span class="text--accent">{{ $t('common.speed.fast') }}</span>
          <span class="text--gas-price">{{ Number(gasCost.average.toFixed(5)) }} {{ symbol }}</span>
        </div>

        <div
          class="column--gas-option"
          :class="selectedGas.speed === 'fast' && 'selected-gas-option'"
          @click="setSelectedGas('fast')"
        >
          <span class="text--accent">{{ $t('common.speed.superFast') }}</span>
          <span class="text--gas-price">{{ Number(gasCost.fast.toFixed(5)) }} {{ symbol }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { GasPrice, SelectedGas } from 'src/modules/gas-api';
import { useStore } from 'src/store';
import { defineComponent, computed, PropType } from 'vue';

export default defineComponent({
  props: {
    gasCost: {
      type: Object as PropType<GasPrice>,
      required: true,
    },
    selectedGas: {
      type: Object as PropType<SelectedGas>,
      required: true,
    },
    setSelectedGas: {
      type: Function,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const symbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : {};
    });

    return { symbol };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/speed-meter.scss';
</style>
