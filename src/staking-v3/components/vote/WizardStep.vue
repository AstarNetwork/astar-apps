<template>
  <div class="wizard-step-container" :class="{ 'wizard-step-selected': isSelected }">
    <div :class="`wizard-step-container-inner ${stepStarted && 'step-started'}`">
      <div class="wizard-step-header">
        <div class="wizard-step-number" :class="{ 'wizard-step-number-selected': isSelected }">
          {{ step.number }}
        </div>
        <div v-if="isCompleted" class="wizard-step-completed"><astar-icon-check /></div>
      </div>
      <div class="wizard-step-title">{{ step.title }}</div>
      <div class="wizard-step-description">{{ step.description }}</div>
      <div :id="`step${step.number}`"></div>
    </div>
    <vote-stake-button-bg />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { WizardItem } from './types';
import VoteStakeButtonBg from '../VoteStakeButtonBg.vue';

export default defineComponent({
  components: {
    VoteStakeButtonBg,
  },
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
    selectedStepIndex: {
      type: Number,
      required: true,
      default: -1,
    },
  },
  setup(props) {
    const stepStarted = computed<boolean>(() => props.selectedStepIndex !== -1);

    return {
      stepStarted,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/voting-wizard.scss';
</style>
