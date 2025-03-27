<template>
  <div ref="wizard" class="wizard-container">
    <div class="wizard-header-container">
      <div class="wizard-header">
        {{ title }}
      </div>
      <div class="balance-container">
        {{
          isBonusEntitledMove
            ? $t('stakingV3.voting.availableToMove')
            : $t('stakingV3.voting.yourAvailableBalance')
        }}
        <token-balance-native :balance="availableToVoteDisplay.toString()" />
      </div>
    </div>
    <div v-if="dappToMoveTokensFrom" class="move--wrapper">
      <div>{{ $t('stakingV3.transferText') }}</div>
      <div class="move--from">
        <div>
          <dapp-icon
            :icon-url="dappToMoveTokensFrom.basic.iconUrl"
            :alt-text="dappToMoveTokensFrom.basic.name"
          />
          <div>{{ dappToMoveTokensFrom.basic.name }}</div>
        </div>
        <div>
          <img alt="token-logo" :src="nativeTokenImg" />
          <token-balance-native
            :balance="availableToMoveFrom.toString()"
            class="nomination--balance"
          />
        </div>
      </div>
      <div v-if="isBonusEntitledMove">
        {{
          allowedNumberOfMoves == 0
            ? $t('stakingV3.looseAllBonusWarning')
            : $t('stakingV3.voting.safeMoveInfo', { number: allowedNumberOfMoves })
        }}
      </div>
    </div>
    <wizard-steps
      v-if="!isMove"
      :steps="wizardSteps"
      :selected-step-index="selectedStepIndex"
      :completed-steps="completedSteps"
      :on-step-selected="handleStepSelected"
    />

    <div v-if="selectedStepIndex >= Steps.ChooseDapps" class="wizard-panels">
      <choose-dapps-panel
        v-if="selectedStepIndex === Steps.ChooseDapps"
        :on-dapps-selected="handleDappsSelected"
        :on-dapps-selection-changed="handleDappsSelectionChanged"
        :scroll-to-top="scrollToWizardTop"
        :move-from-address="moveFromAddress"
        :error-message="looseBonusWarningMessage"
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
        :is-move="isMove"
      />
      <review-panel
        v-if="selectedStepIndex === Steps.Review"
        :dapps="selectedDapps.filter((dapp) => dapp.amount > 0)"
        :total-stake-amount="stakeInfo.totalStakedAmount"
        :on-confirm="handleConfirmAndRestake"
        :on-go-back="handleGoBackToAmount"
      />
    </div>

    <Teleport to="#app--main">
      <modal-restake
        :show="showRestakeModal"
        :set-is-open="setShowRestakeModal"
        :rewards="totalStakerRewards"
        :on-confirm="handleRestakeConfirm"
      />
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WizardItem } from './types';
import { type DappVote, mapToDappVote } from '../../logic';
import { useSelectableComponent, useVote, useDapps, useDappStaking } from 'src/staking-v3/hooks';
import ChooseAmountsPanel, { type StakeInfo } from './enter-amount/ChooseAmountsPanel.vue';
import ReviewPanel from './review/ReviewPanel.vue';
import ChooseDappsPanel from './choose-dapps/ChooseDappsPanel.vue';
import WizardSteps from './WizardSteps.vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import DappIcon from './DappIcon.vue';
import ModalRestake from './re-stake/ModalRestake.vue';
import { useNetworkInfo } from 'src/hooks';

enum Steps {
  ChooseDapps = 0,
  AddAmount = 1,
  Review = 2,
}

export default defineComponent({
  components: {
    WizardSteps,
    ChooseDappsPanel,
    ChooseAmountsPanel,
    ReviewPanel,
    TokenBalanceNative,
    DappIcon,
    ModalRestake,
  },
  props: {
    stakeToAddress: {
      type: String,
      required: false,
      default: undefined,
    },
    moveFromAddress: {
      type: String,
      required: false,
      default: undefined,
    },
    step: {
      type: Number,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const { selectedComponentIndex, handleSelectComponent } = useSelectableComponent(props.step);
    const { registeredDapps, getDapp } = useDapps();
    const { nativeTokenImg } = useNetworkInfo();
    const selectedDapps = ref<DappVote[]>([]);
    const stakesEntered = ref<boolean>(false);
    const isConfirmed = ref<boolean>(false);
    const showRestakeModal = ref<boolean>(false);
    const isLoosingBonus = ref<boolean>(false);
    const wizard = ref();
    const {
      totalStakeAmount,
      remainingLockedTokens,
      availableToVoteDisplay,
      errorMessage,
      refUrl,
      dappToMoveTokensFrom,
      availableToMoveFrom,
      canVote,
      vote,
      isBonusEntitledMove,
      isMove,
      stakeToMove,
      isPartiallyLosingBonus,
      allowedNumberOfMoves,
    } = useVote(selectedDapps, props.moveFromAddress);

    const completedSteps = computed<Map<number, boolean>>(
      () =>
        new Map([
          [Steps.ChooseDapps, selectedDapps.value.length > 0],
          [Steps.AddAmount, stakesEntered.value],
          [Steps.Review, isConfirmed.value],
        ])
    );

    const looseBonusWarningMessage = computed<string>(() =>{
      if (isLoosingBonus.value && allowedNumberOfMoves.value > 0) {
        return t('stakingV3.looseBonusWarning', { number: allowedNumberOfMoves.value });
      }

      if (isLoosingBonus.value && allowedNumberOfMoves.value == 0) {
        return t('stakingV3.looseAllBonusWarning');
      }

      return '';
  });

    const { totalStakerRewards, stakerInfo } = useDappStaking();

    const stakeInfo = computed<StakeInfo>(() => ({
      totalStakedAmount: totalStakeAmount.value,
      remainingLockedTokens: remainingLockedTokens.value,
      availableAfterStaking: availableToVoteDisplay.value,
      errorMessage: errorMessage.value,
      errorRefUrl: refUrl.value,
    }));

    const title = computed<string>(() =>
      props.moveFromAddress ? t('stakingV3.voting.moveFunds') : t('stakingV3.voting.startStaking')
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

    const setShowRestakeModal = (isOpen: boolean): void => {
      showRestakeModal.value = isOpen;
    };

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

    const handleDappsSelectionChanged = (_: DappVote[], after: DappVote[]): void => {
      isLoosingBonus.value = isBonusEntitledMove.value && isPartiallyLosingBonus(after.length);
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

    const handleConfirmAndRestake = async (): Promise<void> => {
      if (totalStakerRewards.value > BigInt(0) && stakerInfo.value.size > 0 && !isMove.value) {
        setShowRestakeModal(true);
      } else {
        await handleConfirm(false);
      }
    };

    const handleConfirm = async (restake: boolean): Promise<void> => {
      scrollToWizardTop();
      isConfirmed.value = true;
      await vote(restake);
      reset();
    };

    const handleRestakeConfirm = async (restake: boolean): Promise<void> => {
      await handleConfirm(restake);
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

    const handleGoBackToAmount = (): void => {
      selectedComponentIndex.value = Steps.AddAmount;
    };

    watch(
      [registeredDapps],
      () => {
        // Preselect a dApp to stake to if the stakeToAddress prop is provided
        if (props.stakeToAddress && registeredDapps.value.length > 0) {
          const dapp = getDapp(props.stakeToAddress);
          if (dapp) {
            selectedDapps.value = [mapToDappVote(dapp)];
            selectedComponentIndex.value = Steps.AddAmount;
          }
        } else if (props.moveFromAddress && registeredDapps.value.length > 0) {
          selectedComponentIndex.value = Steps.ChooseDapps;
        }
      },
      { immediate: true }
    );

    return {
      Steps,
      wizardSteps,
      selectedStepIndex: selectedComponentIndex,
      completedSteps,
      selectedDapps,
      stakeInfo,
      wizard,
      availableToVoteDisplay,
      title,
      dappToMoveTokensFrom,
      availableToMoveFrom,
      nativeTokenImg,
      showRestakeModal,
      totalStakerRewards,
      canVote,
      isBonusEntitledMove,
      isMove,
      isLoosingBonus,
      stakeToMove,
      vote,
      handleStepSelected: handleSelectComponent,
      handleDappsSelected,
      handleVoteAmountChanged,
      handleAmountsEntered,
      handleConfirmAndRestake,
      handleRemoveDapp,
      handleGoBackToDapps,
      handleGoBackToAmount,
      scrollToWizardTop,
      setShowRestakeModal,
      handleRestakeConfirm,
      handleDappsSelectionChanged,
      allowedNumberOfMoves,
      looseBonusWarningMessage,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/voting-wizard.scss';
</style>
