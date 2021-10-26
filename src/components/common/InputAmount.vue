<template>
  <div>
    <label
      class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
      >{{ title }}</label
    >
    <div
      :class="[
        isMaxAmount ? 'tw-border-red-600' : 'tw-border-gray-300',
        isMaxAmount ? 'dark:tw-border-red-700' : 'dark:tw-border-darkGray-500',
        'tw-border',
        'tw-rounded-md',
        'tw-relative',
      ]"
    >
      <div
        :class="[
          !isMaxAmount && 'tw-border-gray-300',
          !isMaxAmount && 'dark:tw-border-darkGray-500',
          'tw-flex',
          'tw-items-center',
        ]"
      >
        <div class="tw-flex-1 tw-pl-8">
          <input
            class="
              tw-w-full tw-text-blue-900
              dark:tw-text-darkGray-100
              tw-text-2xl
              focus:tw-outline-none
              tw-bg-transparent tw-placeholder-gray-300
              dark:tw-placeholder-darkGray-600
            "
            inputmode="decimal"
            type="number"
            min="0"
            pattern="^[0-9]*(\.)?[0-9]*$"
            placeholder="0"
            :value="isInitInput && amount"
            @input="update($event.target.value, selectedUnit)"
            @focus="initInput"
          />
        </div>
        <button v-if="isMaxButton" type="button" class="max" @click="setMaxAmount">
          {{ $t('max') }}
        </button>
        <div
          class="
            tw-text-blue-900
            dark:tw-text-darkGray-100
            tw-text-lg tw-border-l tw-border-gray-300
            dark:tw-border-darkGray-500
            tw-px-3 tw-py-4
          "
        >
          <select
            v-if="!fixUnit && !isH160"
            name="units"
            class="dark:tw-bg-darkGray-900"
            :value="selectedUnit"
            @change="update(amount, $event.target.value)"
          >
            <option v-for="item in arrUnitNames" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <div v-else>{{ selectedUnit }}</div>
        </div>
      </div>
    </div>
    <div
      v-if="isMaxAmount"
      class="
        tw-text-xs tw-font-medium tw-text-red-700
        dark:tw-text-red-600
        tw-absolute tw-bottom-3 tw-left-1/2 tw-transform tw--translate-x-1/2 tw-whitespace-nowrap
      "
    >
      {{ $t('warning.insufficientFee') }}
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, watchEffect, computed } from 'vue';
import { getUnitNames, defaultUnitIndex } from 'src/hooks/helper/units';
import { useStore } from 'src/store';
import BN from 'bn.js';
export default defineComponent({
  props: {
    title: { type: String, default: '' },
    selectedUnit: { type: String, default: '' },
    maxInDefaultUnit: { type: Object as PropType<BN>, default: new BN(0) },
    fixUnit: { type: Boolean, default: false },
    amount: { default: new BN(0), type: (Object as PropType<BN>) || Number },
    isMaxButton: { type: Boolean },
  },
  emits: ['update:amount', 'update:selectedUnit', 'input'],
  setup(props, { emit }) {
    const isMaxAmount = ref<boolean>(false);
    const isInitInput = ref<boolean>(false);
    const arrUnitNames = getUnitNames();
    const update = (amount: BN, unit: string | undefined) => {
      emit('update:amount', amount);
      emit('update:selectedUnit', unit);
      emit('input', { amount, unit });
    };

    const setMaxAmount = () => {
      if (props.maxInDefaultUnit) {
        emit('update:selectedUnit', arrUnitNames[defaultUnitIndex]);
        emit('update:amount', props.maxInDefaultUnit);
      }
    };

    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    watchEffect(() => {
      // Memo: cast from string
      const formattedAmount = new BN(Number(props.amount));
      const formattedMaxInDefaultUnit = new BN(props.maxInDefaultUnit);
      if (formattedMaxInDefaultUnit.eq(new BN(0))) {
        return;
      }

      if (formattedAmount.gte(formattedMaxInDefaultUnit) && !props.isMaxButton) {
        isMaxAmount.value = true;
        return;
      }
      isMaxAmount.value = false;
    });

    watchEffect(() => {
      // Memo: to allow show the default amount for staking modal
      if (!isInitInput.value && Number(props.amount) > 0) {
        isInitInput.value = true;
      }
    });

    const initInput = () => {
      // Memo: Remove default `props.amount->(0)` from input when initialised
      // Memo: `props.amout` is defined by BN or Number from parent components
      try {
        if (props.amount.eq(new BN(0))) {
          emit('update:amount', '');
        }
      } catch (e) {
        if (new BN(props.amount).eq(new BN(0))) {
          emit('update:amount', '');
        }
      }

      if (!isInitInput.value) {
        isInitInput.value = true;
      }
    };

    return { arrUnitNames, update, isMaxAmount, isInitInput, initInput, isH160, setMaxAmount };
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
