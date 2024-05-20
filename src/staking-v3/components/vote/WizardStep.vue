<template>
  <div
    v-if="showStep"
    class="wizard-step-container"
    :class="{ 'wizard-step-selected': isSelected }"
  >
    <div class="wizard-step-header">
      <div class="wizard-step-number" :class="{ 'wizard-step-number-selected': isSelected }">
        {{ step.number }}
      </div>
      <div v-if="isCompleted" class="wizard-step-completed"><astar-icon-check /></div>
    </div>
    <div class="wizard-step-title">{{ step.title }}</div>
    <div>{{ step.description }}</div>
    <div :id="`step${step.number}`"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { WizardItem } from './types';
import { isMobileDevice } from 'src/hooks/helper/wallet';

export default defineComponent({
  props: {
    step: {
      type: Object as PropType<WizardItem>,
      required: true,
    },
    isSelected: {
      type: Boolean,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    // On mobile devices show only the selected step. Show first step initially (if not completed)
    const showStep = computed<boolean>(() =>
      isMobileDevice ?? false
        ? props.isSelected || (props.step.number === 1 && !props.isCompleted)
        : true
    );

    return { showStep };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/voting-wizard.scss';
</style>
