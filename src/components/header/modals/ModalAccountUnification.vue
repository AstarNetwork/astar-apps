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
      <div v-if="currentStep === UnificationSteps.Welcome">
        <au-step1-evm v-if="isH160" :handle-back="backModal" />
        <au-step1-native
          v-else
          :total-cost="totalCost"
          @next="updateSteps(UnificationSteps.ConnectMetamask)"
        />
      </div>
      <div v-else-if="currentStep === UnificationSteps.ConnectMetamask">
        <au-step2
          :selected-evm-address="selectedEvmAddress"
          :is-connected-network="isConnectedNetwork"
          :is-staking="isStaking"
          :is-loading-dapp-staking="isLoadingDappStaking"
          :set-web3="setWeb3"
          :close-modal="closeModal"
          @next="updateSteps(UnificationSteps.SetNameAndAvatar)"
        />
      </div>
      <div v-else-if="currentStep === UnificationSteps.SetNameAndAvatar">
        <au-step3
          :account-name="accountName"
          :set-account-name="setAccountName"
          :selected-evm-address="selectedEvmAddress"
          :is-fetching-xc20-tokens="isFetchingXc20Tokens"
          :is-edit="false"
          :is-busy="isLoading"
          :avatar="avatar"
          @next="
            updateSteps(
              transferXc20Tokens.length > 0
                ? UnificationSteps.TransferXC20
                : UnificationSteps.Overview
            )
          "
          @on-select-nft="updateSteps(UnificationSteps.SelectAvatar)"
        />
      </div>
      <div v-else-if="currentStep === UnificationSteps.EditIdentity && unifiedAccount">
        <au-step3
          :account-name="accountName"
          :set-account-name="setAccountName"
          :selected-evm-address="unifiedAccount.evmAddress"
          :is-fetching-xc20-tokens="false"
          :is-edit="true"
          :is-busy="isLoading"
          :avatar="avatar"
          @next="updateSteps(101)"
          @on-select-nft="updateSteps(UnificationSteps.SelectAvatar)"
        />
      </div>
      <div v-else-if="currentStep === UnificationSteps.TransferXC20">
        <au-step4
          :transfer-xc20-tokens="transferXc20Tokens"
          :handle-transfer-xc20-tokens="handleTransferXc20Tokens"
          :is-sending-xc20-tokens="isSendingXc20Tokens"
          @next="updateSteps(UnificationSteps.Overview)"
        />
      </div>
      <div v-else-if="currentStep === UnificationSteps.Overview">
        <au-step5
          :account-name="accountName"
          :selected-evm-address="selectedEvmAddress"
          :avatar-url="avatar?.image ?? ''"
          :is-busy="isLoading"
          @next="updateSteps(UnificationSteps.Success)"
        />
      </div>
      <div v-else-if="currentStep === UnificationSteps.Success">
        <au-step6 />
      </div>
      <div v-else-if="currentStep === UnificationSteps.SelectAvatar">
        <select-nft
          :evm-address="unifiedAccount ? unifiedAccount.evmAddress : selectedEvmAddress"
          :avatar-metadata="avatar"
          @next="setAvatar"
        />
      </div>
      <div v-else>
        <user-account
          :set-account-name="setAccountName"
          @next="
            unifiedAccount
              ? updateSteps(UnificationSteps.EditIdentity)
              : updateSteps(UnificationSteps.Welcome)
          "
        />
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { useStore } from 'src/store';
import { wait } from '@astar-network/astar-sdk-core';
import { useAccount, useAccountUnification, useBreakpoints } from 'src/hooks';
import { computed, defineComponent, onUnmounted, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import UserAccount from 'src/components/header/modals/account-unification/UserAccount.vue';
import AuStep1Native from 'src/components/header/modals/account-unification/AuStep1Native.vue';
import AuStep1Evm from 'src/components/header/modals/account-unification/AuStep1Evm.vue';
import AuStep2 from 'src/components/header/modals/account-unification/AuStep2.vue';
import AuStep3 from 'src/components/header/modals/account-unification/AuStep3.vue';
import AuStep4 from 'src/components/header/modals/account-unification/AuStep4.vue';
import AuStep5 from 'src/components/header/modals/account-unification/AuStep5.vue';
import AuStep6 from 'src/components/header/modals/account-unification/AuStep6.vue';
import SelectNft from './account-unification/SelectNft.vue';
import { NftMetadata } from 'src/v2/models';

enum UnificationSteps {
  Welcome = 1,
  ConnectMetamask = 2,
  SetNameAndAvatar = 3,
  TransferXC20 = 4,
  Overview = 5,
  Success = 6,
  EditIdentity = 100,
  ExecuteUpdateIdentity = 101,
  SelectAvatar = 200,
}

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
    SelectNft,
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
    const totalCost = ref<string>('');
    const avatar = ref<NftMetadata | undefined>(undefined);

    const {
      selectedEvmAddress,
      isConnectedNetwork,
      isStaking,
      transferXc20Tokens,
      isFetchingXc20Tokens,
      isLoadingDappStaking,
      accountName,
      isSendingXc20Tokens,
      unifiedAccount,
      setAccountName,
      setWeb3,
      handleTransferXc20Tokens,
      unifyAccounts,
      getCost,
      updateAccount,
    } = useAccountUnification();

    const { checkIfUnified } = useAccount();

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

    onMounted(async () => {
      totalCost.value = await getCost();

      if (unifiedAccount.value?.avatarMetadata) {
        avatar.value = unifiedAccount.value?.avatarMetadata;
      }
    });

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

    const setAvatar = async (nft: NftMetadata): Promise<void> => {
      avatar.value = nft;
      await updateSteps(
        unifiedAccount.value ? UnificationSteps.EditIdentity : UnificationSteps.SetNameAndAvatar
      );
    };

    const updateSteps = async (step: number): Promise<void> => {
      if (step === UnificationSteps.Success) {
        // Make a call to unify accounts
        const success = await unifyAccounts(
          currentAccount.value,
          selectedEvmAddress.value,
          accountName.value,
          avatar.value?.contractAddress,
          avatar.value?.tokenId
        );

        if (!success) {
          return;
        }
      } else if (step === UnificationSteps.ExecuteUpdateIdentity) {
        if (unifiedAccount.value) {
          await updateAccount(
            unifiedAccount.value.nativeAddress,
            accountName.value,
            avatar.value?.contractAddress,
            avatar.value?.tokenId
          );
          await checkIfUnified(unifiedAccount.value?.nativeAddress);
        }
      }

      currentStep.value = step;
    };

    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

    const { t } = useI18n();

    const modalTitle = computed((): string => {
      if (currentStep.value === UnificationSteps.Welcome) {
        if (isH160.value) {
          return t('wallet.unifiedAccount.create');
        } else {
          return t('wallet.unifiedAccount.readCarefully');
        }
      } else if (currentStep.value === UnificationSteps.ConnectMetamask) {
        return `${t('wallet.unifiedAccount.create')} : 1`;
      } else if (currentStep.value === UnificationSteps.SetNameAndAvatar) {
        return `${t('wallet.unifiedAccount.create')} : 2`;
      } else if (currentStep.value === UnificationSteps.TransferXC20) {
        return `${t('wallet.unifiedAccount.create')} : 3`;
      } else if (currentStep.value === UnificationSteps.Overview) {
        return `${t('wallet.unifiedAccount.create')} : 4`;
      } else if (currentStep.value === UnificationSteps.Success) {
        return '';
      } else if (currentStep.value === UnificationSteps.EditIdentity) {
        return t('wallet.unifiedAccount.editUnifiedAccount');
      } else if (currentStep.value === UnificationSteps.SelectAvatar) {
        return t('wallet.unifiedAccount.selectAvatar');
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
      totalCost,
      unifiedAccount,
      avatar,
      closeModal,
      backModal,
      updateSteps,
      setWeb3,
      setAccountName,
      handleTransferXc20Tokens,
      setAvatar,
      UnificationSteps,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/select-account.scss';
</style>
