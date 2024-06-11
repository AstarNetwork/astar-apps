<template>
  <swiper
    class="swiper--wizard-steps"
    :slides-per-view="1.4"
    :slides-per-group="1"
    :space-between="8"
    :breakpoints="{
      '768': {
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetween: 8,
      },
    }"
  >
    <swiper-slide v-for="(step, index) in steps" :key="index">
      <wizard-step
        :step="step"
        :is-selected="isStepSelected(index)"
        :is-completed="isStepCompleted(index)"
        :selected-step-index="selectedStepIndex"
        :class="{ 'not-selectable': !isStepSelectable(index) }"
        @click="handleStepSelected(index)"
      />
    </swiper-slide>
  </swiper>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { WizardItem } from './types';
import WizardStep from './WizardStep.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

export default defineComponent({
  components: {
    WizardStep,
    Swiper,
    SwiperSlide,
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
      // Only allow selecting the first step if it's not completed
      if (props.onStepSelected && isStepSelectable(index)) {
        props.onStepSelected(index);
      }
    };

    const isStepSelected = (step: number): boolean => step === props.selectedStepIndex;

    const isStepCompleted = (step: number): boolean => props.completedSteps.get(step) || false;

    const isStepSelectable = (step: number): boolean => step === 0 && !isStepCompleted(step);

    return { isStepSelected, handleStepSelected, isStepCompleted, isStepSelectable };
  },
});
</script>

<style lang="scss" scoped>
.not-selectable {
  cursor: default;
}
</style>

<style lang="scss">
.swiper--wizard-steps {
  overflow: visible;

  .swiper-slide {
    height: auto !important;
  }
}
</style>
