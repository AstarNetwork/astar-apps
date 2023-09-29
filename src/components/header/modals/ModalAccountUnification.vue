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
        <step1-evm v-if="isH160" :handle-back="backModal" />
        <step1-native v-else @next="updateSteps(2)" />
      </div>
      <div v-else-if="currentStep === 2">
        <step2
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
        <step3
          :account-name="accountName"
          :set-account-name="setAccountName"
          :selected-evm-address="selectedEvmAddress"
          :is-fetching-xc20-tokens="isFetchingXc20Tokens"
          @next="updateSteps(transferXc20Tokens.length > 0 ? 4 : 5)"
        />
      </div>
      <div v-else-if="currentStep === 4">
        <step4 :transfer-xc20-tokens="transferXc20Tokens" @next="updateSteps(5)" />
      </div>
      <div v-else-if="currentStep === 5">
        <step5
          :account-name="accountName"
          :selected-evm-address="selectedEvmAddress"
          @next="updateSteps(6)"
        />
      </div>
      <div v-else-if="currentStep === 6">
        <step6 />
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
import Step1Native from 'src/components/header/modals/account-unification/Step1Native.vue';
import Step1Evm from 'src/components/header/modals/account-unification/Step1Evm.vue';
import Step2 from 'src/components/header/modals/account-unification/Step2.vue';
import Step3 from 'src/components/header/modals/account-unification/Step3.vue';
import Step4 from 'src/components/header/modals/account-unification/Step4.vue';
import Step5 from 'src/components/header/modals/account-unification/Step5.vue';
import Step6 from 'src/components/header/modals/account-unification/Step6.vue';

export default defineComponent({
  components: {
    UserAccount,
    Step1Native,
    Step1Evm,
    Step2,
    Step3,
    Step4,
    Step5,
    Step6,
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

    const {
      selectedEvmAddress,
      isConnectedNetwork,
      isStaking,
      transferXc20Tokens,
      isFetchingXc20Tokens,
      isLoadingDappStaking,
      accountName,
      setAccountName,
      setWeb3,
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
      closeModal,
      backModal,
      updateSteps,
      setWeb3,
      setAccountName,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
</style>
