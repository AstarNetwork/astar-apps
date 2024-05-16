<template>
  <div class="wizard-container">
    <div class="wizard-header">{{ $t('stakingV3.voting.startStaking') }}</div>
    <wizard-steps
      :steps="wizardSteps"
      :selected-step-index="selectedStepIndex"
      :on-step-selected="handleStepSelected"
    />

    <div class="wizard-panels">
      <choose-dapps-panel v-if="selectedStepIndex === 0" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import WizardSteps from './WizardSteps.vue';
import { WizardItem } from './types';
import { useI18n } from 'vue-i18n';
import ChooseDappsPanel from './choose-dapps/ChooseDappsPanel.vue';
import { useSelectableComponent } from 'src/staking-v3/hooks';

export default defineComponent({
  components: {
    WizardSteps,
    ChooseDappsPanel,
  },
  setup() {
    const { t } = useI18n();
    const { selectedComponentIndex, handleSelectComponent } = useSelectableComponent();
    const completedSteps = ref<Map<number, boolean>>(new Map());

    const wizardSteps: WizardItem[] = [
      {
        title: t('stakingV3.voting.chooseDapps'),
        description: t('stakingV3.voting.chooseDappsDescription'),
        number: 1,
      },
      {
        title: t('stakingV3.voting.addAmount'),
        description: t('stakingV3.voting.addAmountDescription'),
        number: 2,
      },
      {
        title: t('stakingV3.voting.allDone'),
        description: t('stakingV3.voting.allDoneDescription'),
        number: 3,
      },
    ];

    return {
      wizardSteps,
      selectedStepIndex: selectedComponentIndex,
      handleStepSelected: handleSelectComponent,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/voting-wizard.scss';
</style>
