<template>
  <div>
    <div class="container--speed-configuration" :class="isResponsible && 'container--responsible'">
      <div class="box__space-between">
        <span> {{ $t(isH160 ? 'common.speed.speed' : 'common.speed.speedTip') }}</span>
        <div v-if="isH160" class="placeholder--height" />
        <div v-else>
          <IconHelp />
          <q-tooltip>
            <span class="text--tooltip">{{ $t('common.speed.tipHelp') }}</span>
          </q-tooltip>
        </div>
      </div>
      <div class="box__row">
        <div
          class="column--gas-option"
          :class="selectedGas.speed === 'slow' && 'selected-gas-option'"
          @click="setSelectedGas('slow')"
        >
          <span class="text--accent">{{ $t('common.speed.average') }}</span>
          <span class="text--gas-price">
            {{ formatPrice(gasCost.slow) }}
            {{ symbol }}
          </span>
        </div>

        <div
          class="column--gas-option"
          :class="selectedGas.speed === 'average' && 'selected-gas-option'"
          @click="setSelectedGas('average')"
        >
          <span class="text--accent">{{ $t('common.speed.fast') }}</span>
          <span class="text--gas-price">
            {{ formatPrice(gasCost.average) }}
            {{ symbol }}
          </span>
        </div>

        <div
          class="column--gas-option"
          :class="selectedGas.speed === 'fast' && 'selected-gas-option'"
          @click="setSelectedGas('fast')"
        >
          <span class="text--accent">{{ $t('common.speed.superFast') }}</span>
          <span class="text--gas-price">
            {{ formatPrice(gasCost.fast) }}
            {{ symbol }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { GasPrice, SelectedGas } from 'src/modules/gas-api';
import { useStore } from 'src/store';
import { defineComponent, computed, PropType } from 'vue';
import IconHelp from 'src/components/common/IconHelp.vue';

export default defineComponent({
  components: { IconHelp },
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
    // Memo: parameter for modals made by tailwind css
    isResponsible: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const decimal = computed(() => (isH160.value ? 5 : 8));
    const symbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : {};
    });

    const formatPrice = (price: string): string => {
      const num = Number(price).toFixed(decimal.value);
      // Memo: remove the number of '0' after decimal
      return num.replace(/\.?0+$/, '');
    };

    return { symbol, isH160, formatPrice };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/speed-configuration.scss';
</style>
