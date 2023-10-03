<template>
  <astar-modal-drawer
    :show="isOpen && !isSelected"
    :title="modalTitle"
    :is-closing="isClosing"
    :is-back="true"
    :handle-back="backModal"
    @close="closeModal"
  >
    <div class="wrapper--modal-account">
      <div v-if="currentStep === 1">
        <au-step1-evm v-if="isH160" :handle-back="backModal" />
        <au-step1-native v-else @next="updateSteps(2)" />
      </div>
      <div v-else-if="currentStep === 2">
        <au-step2
          :selected-evm-address="selectedEvmAddress"
          :is-connected-network="isConnectedNetwork"
          :is-staking="isStaking"
          :is-loading-dapp-staking="isLoadingDappStaking"
          :set-web3="setWeb3"
          :close-modal="closeModal"
          @next="updateSteps(3)"
        />
      </div>
      <div v-else-if="currentStep === 3">
        <au-step3
          :account-name="accountName"
          :set-account-name="setAccountName"
          :selected-evm-address="selectedEvmAddress"
          :is-fetching-xc20-tokens="isFetchingXc20Tokens"
          @next="updateSteps(transferXc20Tokens.length > 0 ? 4 : 5)"
        />
      </div>
      <div v-else-if="currentStep === 4">
        <step4
          :transfer-xc20-tokens="transferXc20Tokens"
          :handle-transfer-xc20-tokens="handleTransferXc20Tokens"
          :is-sending-xc20-tokens="isSendingXc20Tokens"
          @next="updateSteps(5)"
        />
        <au-step4
          :transfer-xc20-tokens="transferXc20Tokens"
          :handle-transfer-xc20-tokens="handleTransferXc20Tokens"
          :is-sending-xc20-tokens="isSendingXc20Tokens"
          @next="updateSteps(5)"
        />
      </div>
      <div v-else-if="currentStep === 5">
        <au-step5
          :account-name="accountName"
          :selected-evm-address="selectedEvmAddress"
          :is-busy="isLoading"
          @next="updateSteps(6)"
        />
      </div>
      <div v-else-if="currentStep === 6">
        <au-step6 />
      </div>
      <div v-else>
        <user-account @next="updateSteps(1)" />
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { useStore } from 'src/store';
import { wait } from '@astar-network/astar-sdk-core';
import { useAccount, useAccountUnification, useBreakpoints } from 'src/hooks';
import { computed, defineComponent, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import UserAccount from 'src/components/header/modals/account-unification/UserAccount.vue';
import AuStep1Native from 'src/components/header/modals/account-unification/AuStep1Native.vue';
import AuStep1Evm from 'src/components/header/modals/account-unification/AuStep1Evm.vue';
import AuStep2 from 'src/components/header/modals/account-unification/AuStep2.vue';
import AuStep3 from 'src/components/header/modals/account-unification/AuStep3.vue';
import AuStep4 from 'src/components/header/modals/account-unification/AuStep4.vue';
import AuStep5 from 'src/components/header/modals/account-unification/AuStep5.vue';
import AuStep6 from 'src/components/header/modals/account-unification/AuStep6.vue';

export default defineComponent({
  components: {
    UserAccount,
    AuStep1Native,
    AuStep1Evm,
    AuStep2,
    AuStep3,
    AuStep4,
    AuStep5,
    AuStep6,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    openSelectModal: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const isSelected = ref<boolean>(false);
    const isClosing = ref<boolean>(false);
    const currentStep = ref<number>(0);
    const { currentAccount } = useAccount();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    const {
      selectedEvmAddress,
      isConnectedNetwork,
      isStaking,
      transferXc20Tokens,
      isFetchingXc20Tokens,
      isLoadingDappStaking,
      accountName,
      isSendingXc20Tokens,
      setAccountName,
      setWeb3,
      handleTransferXc20Tokens,
      unifyAccounts,
    } = useAccountUnification();

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      emit('update:is-open', false);
    };

    const backModal = async (): Promise<void> => {
      await closeModal();
      props.openSelectModal();
    };

    const { width, screenSize } = useBreakpoints();

    const windowHeight = ref<number>(window.innerHeight);
    const onHeightChange = (): void => {
      const adjustment = width.value > screenSize.sm ? 520 : 390;
      windowHeight.value = window.innerHeight - adjustment;
    };

    window.addEventListener('resize', onHeightChange);
    onHeightChange();

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

    const updateSteps = async (step: number): Promise<void> => {
      if (step === 6) {
        // Make a call to unify accounts
        const success = await unifyAccounts(
          currentAccount.value,
          selectedEvmAddress.value,
          accountName.value
        );

        if (!success) {
          return;
        }
      }

      currentStep.value = step;
    };

    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

    const { t } = useI18n();

    const modalTitle = computed((): string => {
      if (currentStep.value === 1) {
        if (isH160.value) {
          return t('wallet.unifiedAccount.create');
        } else {
          return t('wallet.unifiedAccount.readCarefully');
        }
      } else if (currentStep.value === 2) {
        return `${t('wallet.unifiedAccount.create')} : 1`;
      } else if (currentStep.value === 3) {
        return `${t('wallet.unifiedAccount.create')} : 2`;
      } else if (currentStep.value === 4) {
        return `${t('wallet.unifiedAccount.create')} : 3`;
      } else if (currentStep.value === 5) {
        return `${t('wallet.unifiedAccount.create')} : 4`;
      } else if (currentStep.value === 6) {
        return '';
      } else {
        return t('wallet.unifiedAccount.yourAccount');
      }
    });

    return {
      windowHeight,
      isSelected,
      isClosing,
      currentStep,
      modalTitle,
      isH160,
      selectedEvmAddress,
      isConnectedNetwork,
      isStaking,
      transferXc20Tokens,
      isFetchingXc20Tokens,
      isLoadingDappStaking,
      accountName,
      isSendingXc20Tokens,
      isLoading,
      closeModal,
      backModal,
      updateSteps,
      setWeb3,
      setAccountName,
      handleTransferXc20Tokens,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
</style>
