<template>
  <div class="wizard-steps-container">
    <wizard-step
      v-for="(step, index) in steps"
      :key="index"
      :step="step"
      :is-selected="isStepSelected(index)"
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

    return { isStepSelected, handleStepSelected };
  },
});
</script>

<!-- <style lang="scss" scoped>
@import 'src/staking-v3/components/styles/voting-wizard.scss';
</style> -->
