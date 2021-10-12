<template>
  <div>
    <label
      class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
    >
      {{ title }}
    </label>
    <div
      class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-relative"
    >
      <div
        class="tw-flex tw-items-center tw-border-b tw-border-gray-300 dark:tw-border-darkGray-500"
      >
        <div class="tw-flex-1 tw-pl-8">
          <input
            class="tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 tw-text-2xl focus:tw-outline-none tw-bg-transparent tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600"
            inputmode="decimal"
            type="number"
            min="0"
            pattern="^[0-9]*(\.)?[0-9]*$"
            placeholder="0.0"
            :value="amount"
            @input="update($event.target.value, selectedUnit)"
          />
        </div>
        <button
          v-if="!noMax"
          type="button"
          @click="setMaxAmount"
          class="max"
        >
          {{ $t('max') }}
        </button>
        <div
          class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-text-lg tw-border-l tw-border-gray-300 dark:tw-border-darkGray-500 tw-px-3 tw-py-4"
        >
          <select
            v-if="!fixUnit"
            name="units"
            class="dark:tw-bg-darkGray-900"
            :value="selectedUnit"
            @change="update(amount, $event.target.value)"
          >
            <option v-for="item in arrUnitNames" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <div v-else>
            {{ selectedUnit }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { getUnitNames, defaultUnitIndex } from 'src/hooks/helper/units';
import BN from 'bn.js';
export default defineComponent({
  props: {
    title: { type: String },
    noMax: { type: Boolean },
    selectedUnit: { type: String },
    maxInDefaultUnit: Object as PropType<BN>,
    fixUnit: { type: Boolean, default: false },
    amount: { required: true, type: Object as PropType<BN> },
  },
  emits: ['update:amount', 'update:selectedUnit', 'input'],
  setup(props, { emit }) {
    const arrUnitNames = getUnitNames();
    const setMaxAmount = () => {
      if (props.maxInDefaultUnit) {
        emit('update:selectedUnit', arrUnitNames[defaultUnitIndex]);
        emit('update:amount', props.maxInDefaultUnit);
      }
    };
    const update = (amount: BN, unit: string | undefined) => {
      emit('update:amount', amount);
      emit('update:selectedUnit', unit);
      emit('input', { amount, unit });
    };
    return { arrUnitNames, setMaxAmount, update };
  },
});
</script>

<style scoped>
  .max {
    @apply tw-bg-blue-100 dark:tw-bg-blue-200 tw-text-xs tw-rounded-full tw-px-3 tw-py-2 tw-text-blue-900 dark:tw-text-darkGray-900 tw-mx-3;
  }
  .max:hover {
    @apply tw-bg-blue-200 dark:tw-bg-blue-300;
  }
  .max:focus {
    @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-300;
  }
</style>