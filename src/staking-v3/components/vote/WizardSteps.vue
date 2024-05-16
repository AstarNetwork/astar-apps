<template>
  <div class="wizard-steps-container">
    <wizard-step
      v-for="(step, index) in steps"
      :key="index"
      :step="step"
      :is-selected="isStepSelected(index)"
      :is-completed="isStepCompleted(index)"
      @click="handleStepSelected(index)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { WizardItem } from './types';
import WizardStep from './WizardStep.vue';

export default defineComponent({
  components: {
    WizardStep,
  },
  props: {
    steps: {
      type: Array as PropType<WizardItem[]>,
      required: true,
    },
    selectedStepIndex: {
      type: Number,
      required: false,
      default: undefined,
    },
    completedSteps: {
      type: Object as PropType<Map<number, boolean>>,
      required: false,
      default: () => new Map(),
    },
    onStepSelected: {
      type: Function as PropType<(stepIndex: number) => void>,
      required: true,
    },
  },
  setup(props) {
    const handleStepSelected = (index: number) => {
      if (props.onStepSelected) {
        props.onStepSelected(index);
      }
    };

    const isStepSelected = (step: number): boolean => step === props.selectedStepIndex;

    const isStepCompleted = (step: number): boolean => props.completedSteps.get(step) || false;

    return { isStepSelected, handleStepSelected, isStepCompleted };
  },
});
</script>

<!-- <style lang="scss" scoped>
@import 'src/staking-v3/components/styles/voting-wizard.scss';
</style> -->
