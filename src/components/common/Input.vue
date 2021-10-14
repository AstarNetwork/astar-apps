<template>
  <div class="text-left relative mb-6">
    <label
      v-if="label"
      class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
    >
      {{ label }}
      <strong v-if="input && input.required" class="text-danger">*</strong>
    </label>
    <input
      v-bind="$attrs"
      ref="input"
      class="
        tw-border tw-border-gray-300
        dark:tw-border-darkGray-500
        tw-rounded-md tw-w-full tw-text-blue-900
        dark:tw-text-darkGray-100
        focus:tw-outline-none
        tw-placeholder-gray-300
        dark:tw-placeholder-darkGray-600
        tw-px-3 tw-py-3 tw-appearance-none tw-bg-white
        dark:tw-bg-darkGray-900
      "
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <span
      v-if="innerLabel"
      class="
        tw-absolute tw-bottom-0 tw-right-0 tw-text-xl tw-font-light tw-pt-2 tw-pb-2 tw-pl-4 tw-pr-4
      "
      >{{ innerLabel }}</span
    >
    <div
      :style="{ opacity: validationMessage ? '1' : '0.01' }"
      class="tw-text-red-700 tw-mt-1 tw-mb-2 tw-text-sm tw-h-4"
    >
      {{ validationMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    label: {
      type: String,
      default: '',
    },
    innerLabel: {
      type: String,
      default: '',
    },
    modelValue: {
      type: [String, Number],
      default: '',
    },
    validationMessage: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup() {
    const input = ref();

    return { input };
  },
});
</script>
