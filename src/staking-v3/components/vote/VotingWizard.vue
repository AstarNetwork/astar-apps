<template>
  <div class="wizard-container">
    <div class="wizard-header">{{ $t('stakingV3.voting.startStaking') }}</div>
    <wizard-steps
      :steps="wizardSteps"
      :selected-step-index="selectedStepIndex"
      :completed-steps="completedSteps"
      :on-step-selected="handleStepSelected"
    />

    <div class="wizard-panels">
      <choose-dapps-panel v-if="selectedStepIndex === 0" :on-dapps-selected="handleDappsSelected" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import WizardSteps from './WizardSteps.vue';
import { WizardItem } from './types';
import { useI18n } from 'vue-i18n';
import ChooseDappsPanel from './choose-dapps/ChooseDappsPanel.vue';
import { useSelectableComponent } from 'src/staking-v3/hooks';
import { Dapp } from './choose-dapps/Model';

enum Steps {
  ChooseDapps,
  AddAmount,
  Review,
}

export default defineComponent({
  components: {
    WizardSteps,
    ChooseDappsPanel,
  },
  setup() {
    const { t } = useI18n();
    const { selectedComponentIndex, handleSelectComponent } = useSelectableComponent();
    const selectedDapps = ref<Dapp[]>([]);
    const completedSteps = computed<Map<number, boolean>>(
      () =>
        new Map([
          [Steps.ChooseDapps, selectedDapps.value.length > 0],
          [Steps.AddAmount, false],
          [Steps.Review, false],
        ])
    );

    const wizardSteps: WizardItem[] = [
      {
        title: t('stakingV3.voting.chooseDapps'),
        description: t('stakingV3.voting.chooseDappsDescription'),
        number: Steps.ChooseDapps + 1,
      },
      {
        title: t('stakingV3.voting.addAmount'),
        description: t('stakingV3.voting.addAmountDescription'),
        number: Steps.AddAmount + 1,
      },
      {
        title: t('stakingV3.voting.allDone'),
        description: t('stakingV3.voting.allDoneDescription'),
        number: Steps.Review + 1,
      },
    ];

    const handleDappsSelected = (dapps: Dapp[]): void => {
      selectedDapps.value = dapps;
      selectedComponentIndex.value = Steps.AddAmount;
      console.log('Selected dapps:', dapps);
    };

    return {
      wizardSteps,
      selectedStepIndex: selectedComponentIndex,
      completedSteps,
      handleStepSelected: handleSelectComponent,
      handleDappsSelected,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/voting-wizard.scss';
</style>
