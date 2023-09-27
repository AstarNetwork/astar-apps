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
        <step1-evm v-if="isH160" />
        <step1-native v-else @next="updateSteps(2)" />
      </div>
      <div v-else-if="currentStep === 2">
        <step2
          :selected-evm-address="selectedEvmAddress"
          :set-web3="setWeb3"
          :is-connected-network="isConnectedNetwork"
          :is-staking="isStaking"
          @next="updateSteps(3)"
        />
      </div>
      <div v-else-if="currentStep === 3">
        <step3 :selected-evm-address="selectedEvmAddress" @next="updateSteps(4)" />
      </div>
      <div v-else-if="currentStep === 4">
        <step4 @next="updateSteps(5)" />
      </div>
      <div v-else-if="currentStep === 5">
        <step5 @next="updateSteps(6)" />
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
import { useAccountUnification, useBreakpoints } from 'src/hooks';
import { computed, defineComponent, onUnmounted, ref } from 'vue';
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

    const modalTitle = computed((): string => {
      if (currentStep.value === 1) {
        return 'Create Unified Account';
      } else if (currentStep.value === 2) {
        return 'Create Unified Account : 1';
      } else if (currentStep.value === 3) {
        return 'Create Unified Account : 2';
      } else if (currentStep.value === 4) {
        return 'Create Unified Account : 3';
      } else if (currentStep.value === 5) {
        return 'Create Unified Account : 4';
      } else if (currentStep.value === 6) {
        return '';
      } else {
        return 'Your Account';
      }
    });

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

    const updateSteps = (step: number): void => {
      currentStep.value = step;
    };

    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

    const { selectedEvmAddress, isConnectedNetwork, isStaking, setWeb3 } = useAccountUnification();

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
      closeModal,
      backModal,
      updateSteps,
      setWeb3,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
</style>
