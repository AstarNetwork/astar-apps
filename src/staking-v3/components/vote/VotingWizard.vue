<template>
  <div ref="wizard" class="wizard-container">
    <div class="wizard-header">{{ $t('stakingV3.voting.startStaking') }}</div>
    <wizard-steps
      :steps="wizardSteps"
      :selected-step-index="selectedStepIndex"
      :completed-steps="completedSteps"
      :on-step-selected="handleStepSelected"
    />

    <div v-if="selectedStepIndex >= Steps.ChooseDapps" class="wizard-panels">
      <choose-dapps-panel
        v-if="selectedStepIndex === Steps.ChooseDapps"
        :on-dapps-selected="handleDappsSelected"
        :scroll-to-top="scrollToWizardTop"
      />
      <choose-amounts-panel
        v-if="selectedStepIndex === Steps.AddAmount"
        :dapps="selectedDapps"
        :stake-info="stakeInfo"
        :can-submit="canVote"
        :on-amount-changed="handleVoteAmountChanged"
        :on-amounts-entered="handleAmountsEntered"
        :on-remove-dapp="handleRemoveDapp"
        :on-go-back="handleGoBackToDapps"
      />
      <review-panel
        v-if="selectedStepIndex === Steps.Review"
        :dapps="selectedDapps.filter((dapp) => dapp.amount > 0)"
        :total-stake-amount="stakeInfo.totalStakedAmount"
        :on-confirm="handleConfirm"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import WizardSteps from './WizardSteps.vue';
import { WizardItem } from './types';
import { useI18n } from 'vue-i18n';
import ChooseDappsPanel from './choose-dapps/ChooseDappsPanel.vue';
import { useSelectableComponent, useVote } from 'src/staking-v3/hooks';
import { DappVote } from '../../logic';
import ChooseAmountsPanel, { StakeInfo } from './enter-amount/ChooseAmountsPanel.vue';
import ReviewPanel from './review/ReviewPanel.vue';

enum Steps {
  ChooseDapps,
  AddAmount,
  Review,
}

export default defineComponent({
  components: {
    WizardSteps,
    ChooseDappsPanel,
    ChooseAmountsPanel,
    ReviewPanel,
  },
  setup() {
    const { t } = useI18n();
    const { selectedComponentIndex, handleSelectComponent } = useSelectableComponent();
    const selectedDapps = ref<DappVote[]>([]);
    const stakesEntered = ref<boolean>(false);
    const isConfirmed = ref<boolean>(false);
    const wizard = ref();
    const {
      totalStakeAmount,
      remainingLockedTokens,
      canVote,
      vote,
      availableToVoteDisplay,
      errorMessage,
      refUrl,
    } = useVote(selectedDapps);
    const completedSteps = computed<Map<number, boolean>>(
      () =>
        new Map([
          [Steps.ChooseDapps, selectedDapps.value.length > 0],
          [Steps.AddAmount, stakesEntered.value],
          [Steps.Review, isConfirmed.value],
        ])
    );

    const stakeInfo = computed<StakeInfo>(() => ({
      totalStakedAmount: totalStakeAmount.value,
      remainingLockedTokens: remainingLockedTokens.value,
      availableAfterStaking: availableToVoteDisplay.value,
      errorMessage: errorMessage.value,
      errorRefUrl: refUrl.value,
    }));

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

    const scrollToWizardTop = (): void => {
      if (wizard.value) {
        wizard.value.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const handleDappsSelected = (dapps: DappVote[]): void => {
      selectedDapps.value = dapps;
      selectedComponentIndex.value = Steps.AddAmount;
      scrollToWizardTop();
    };

    const handleAmountsEntered = (): void => {
      selectedComponentIndex.value = Steps.Review;
      stakesEntered.value = true;
      scrollToWizardTop();
    };

    const reset = (): void => {
      selectedComponentIndex.value = -1;
      selectedDapps.value = [];
      stakesEntered.value = false;
      isConfirmed.value = false;
    };

    const handleConfirm = async (): Promise<void> => {
      scrollToWizardTop();
      isConfirmed.value = true;
      await vote();
      reset();
    };

    const handleVoteAmountChanged = (dapp: DappVote, amount: number): void => {
      dapp.amount = amount;
    };

    const handleRemoveDapp = (dapp: DappVote): void => {
      const index = selectedDapps.value.findIndex((d) => d.id === dapp.id);
      if (index >= 0) {
        selectedDapps.value.splice(index, 1);
      }
    };

    const handleGoBackToDapps = (): void => {
      selectedComponentIndex.value = Steps.ChooseDapps;
    };

    return {
      Steps,
      wizardSteps,
      selectedStepIndex: selectedComponentIndex,
      completedSteps,
      selectedDapps,
      stakeInfo,
      wizard,
      availableToVoteDisplay,
      canVote,
      vote,
      handleStepSelected: handleSelectComponent,
      handleDappsSelected,
      handleVoteAmountChanged,
      handleAmountsEntered,
      handleConfirm,
      handleRemoveDapp,
      handleGoBackToDapps,
      scrollToWizardTop,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/voting-wizard.scss';
</style>
