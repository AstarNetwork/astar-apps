<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-overflow-hidden tw-shadow tw-rounded-lg
      sm:tw-col-span-2
      tw-text-blue-900
      dark:tw-text-darkGray-100
      tw-p-5 tw-pb-14
      sm:tw-grid
      tw-grid-cols-2 tw-gap-4
      xl:tw-col-span-3
    "
  >
    <div>
      <div class="tw-flex tw-items-center tw-pt-1">
        <div class="tw-h-10 tw-w-10 tw-overflow-hidden">
          <Logo :small="true" class="tw-w-8" />
        </div>
        <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold tw-text-lg">
          {{ defaultUnitToken }} {{ $t('balance.transferable') }}
        </p>
      </div>

      <div class="tw-flex tw-flex-col tw-h-full tw-justify-center">
        <div class="tw-flex tw-justify-center">
          <div>
            <p class="tw-font-semibold tw-text-center">
              <span class="tw-text-3xl tw-tracking-tight tw-leading-tight">
                <format-balance :balance="accountData?.getUsableTransactionBalance()" />
              </span>
            </p>
          </div>
        </div>

        <div
          class="
            tw-mt-8
            xl:tw-mt-1
            tw-text-center tw-mb-6
            sm:tw-mb-0
            tw-flex tw-flex-col
            2xl:tw-flex-row
            tw-justify-center tw-items-center
            xl:tw-gap-x-1
            2xl:tw-gap-x-2
            tw-gap-y-4
            xl:tw-pt-3
          "
        >
          <div
            class="
              tw-flex tw-flex-col
              xl:tw-flex-row
              tw-gap-y-4
              xl:tw-gap-x-4
              tw-flex-wrap tw-justify-center
            "
          >
            <button
              type="button"
              :disabled="!address"
              class="transfer-button small-button"
              :class="!address ? 'disabled_btn' : ''"
              @click="openTransferModal"
            >
              {{ $t('balance.transfer') }}
            </button>
            <Button
              class="transfer-button"
              :class="isEvmDeposit ? 'large-button' : 'small-button'"
              @click="showVestingInfo"
            >
              {{ $t('balance.vestingInfo') }}
            </Button>
            <button
              v-if="!isH160"
              type="button"
              class="transfer-button small-button"
              :disabled="isFaucetLoading"
              @click="openFaucetModal"
            >
              {{ $t('balance.faucet') }}
            </button>
            <button
              v-if="isEvmDeposit && !isH160"
              type="button"
              class="transfer-button"
              @click="openWithdrawalModal"
            >
              {{ $t('balance.withdrawEvm') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="tw-text-sm tw-flex tw-flex-col tw-gap-y-5">
      <div
        class="
          tw-flex tw-flex-col tw-justify-between tw-bg-blue-50
          dark:tw-bg-darkGray-700
          tw-rounded-lg tw-py-3 tw-px-4
        "
      >
        <div class="tw-flex tw-justify-between tw-items-center">
          <div>
            {{ $t('balance.claimable') }}
          </div>
          <div class="tw-font-bold tw-text-right tw-fle">
            <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight">
              <format-balance :balance="accountData?.vestedClaimable" />
            </span>
          </div>
        </div>
        <div class="tw-flex tw-justify-between tw-items-center">
          <div>
            {{ $t('balance.remainingVests') }}
          </div>
          <div>
            <p class="tw-font-bold tw-text-right">
              <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight">
                <format-balance :balance="accountData?.remainingVests" />
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        class="
          tw-flex tw-justify-between tw-items-center tw-bg-blue-50
          dark:tw-bg-darkGray-700
          tw-rounded-lg tw-py-3 tw-px-4
        "
      >
        <div>{{ $t('balance.locked') }}</div>
        <div>
          <p class="tw-font-bold tw-text-right">
            <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight">
              <format-balance :balance="accountData?.miscFrozen" />
            </span>
          </p>
        </div>
      </div>

      <div
        v-if="!isH160"
        class="
          tw-flex tw-justify-between tw-items-center tw-bg-blue-50
          dark:tw-bg-darkGray-700
          tw-rounded-lg tw-mb-0 tw-py-3 tw-px-4
        "
      >
        <div>{{ $t('balance.evmDeposit') }}</div>
        <div>
          <p class="tw-font-bold tw-text-right">
            <span class="tw-text-2xl md:tw-text-xl xl:tw-text-2xl tw-leading-tight">
              <format-balance :balance="evmDeposit" />
            </span>
          </p>
        </div>
      </div>

      <div
        v-if="isEthWallet"
        class="
          tw-flex tw-justify-center tw-items-center tw-mb-0 tw-py-3 tw-px-2
          sm:tw-mt-2
          md:tw-self-end md:tw-w-50
          xl:tw-px-5 xl:tw-mt-0
          tw-cursor-pointer tw-bg-blue-500 tw-rounded-full tw-shadow-sm
        "
        @click="toggleMetaMaskSchema"
      >
        <div>
          <p class="tw-font-bold tw-text-right">
            <span class="tw-leading-tight tw-text-xs tw-text-white">{{
              $t('balance.switchToLockdrop', { value: isH160 ? 'Lockdrop' : 'EVM' })
            }}</span>
          </p>
        </div>
      </div>
    </div>
    <ModalVestingInfo
      v-if="showVestingModal"
      v-model:isOpen="showVestingModal"
      :account-data="accountData"
      :unlock-function="unlockVestedTokens"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, toRefs, computed, PropType, ref } from 'vue';
import { AccountData, useChainMetadata, useEvmDeposit, useConnectWallet } from 'src/hooks';
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { useExtrinsicCall } from 'src/hooks/custom-signature/useExtrinsicCall';
import FormatBalance from 'components/balance/FormatBalance.vue';
import Button from 'src/components/common/Button.vue';
import ModalVestingInfo from 'components/balance/modals/ModalVestingInfo.vue';
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import { getInjector } from 'src/hooks/helper/wallet';
import Logo from '../common/Logo.vue';
import { hasExtrinsicFailedEvent } from 'src/store/dapp-staking/actions';

export default defineComponent({
  components: {
    FormatBalance,
    Logo,
    Button,
    ModalVestingInfo,
  },
  props: {
    address: {
      type: String,
      required: true,
    },
    accountData: {
      type: Object as PropType<AccountData>,
      required: true,
    },
    isFaucetLoading: {
      type: Boolean,
      required: true,
    },
  },
  emits: [
    'update:is-open-transfer',
    'update:is-open-withdrawal-evm-deposit',
    'update:is-open-modal-faucet',
  ],
  setup(props, { emit }) {
    const store = useStore();
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const { api } = useApi();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
    const showVestingModal = ref<boolean>(false);

    const openTransferModal = (): void => {
      emit('update:is-open-transfer', true);
    };

    const openWithdrawalModal = (): void => {
      emit('update:is-open-withdrawal-evm-deposit', true);
    };

    const openFaucetModal = (): void => {
      emit('update:is-open-modal-faucet', true);
    };

    const handleVestingError = (error: Error): void => {
      console.log(error);
      store.commit('general/setLoading', false);
      store.dispatch('general/showAlertMsg', {
        msg: error.message,
        alertType: 'error',
      });
    };

    const handleTransactionError = (e: Error): void => {
      console.error(e);
      store.dispatch('general/showAlertMsg', {
        msg: `Transaction failed with error: ${e.message}`,
        alertType: 'error',
      });
    };

    const handleResult = (result: ISubmittableResult): void => {
      const status = result.status;
      if (status.isInBlock) {
        if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
          const msg = `Completed at block hash #${status.asInBlock.toString()}`;

          store.dispatch('general/showAlertMsg', {
            msg,
            alertType: 'success',
          });
        }

        store.commit('general/setLoading', false);
      } else {
        if (status.type !== 'Finalized') {
          store.commit('general/setLoading', true);
        }
      }
    };

    const { callFunc } = useExtrinsicCall({
      onResult: handleResult,
      onTransactionError: handleTransactionError,
    });

    const unlockVestedTokensEthExtrinsic = async (): Promise<void> => {
      try {
        const fn: SubmittableExtrinsicFunction<'promise'> | undefined = api?.value?.tx.vesting.vest;
        const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn();

        method && callFunc(method);
        showVestingModal.value = false;
      } catch (e) {
        console.error(e);
        store.dispatch('general/showAlertMsg', {
          msg: (e as Error).message,
          alertType: 'error',
        });
      }
    };

    const unlockVestedTokensSubstrate = async (): Promise<void> => {
      try {
        if (isEthWallet.value) {
          const fn: SubmittableExtrinsicFunction<'promise'> | undefined =
            api?.value?.tx.vesting.vest;
          const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn();
          method && callFunc(method);
        } else {
          const injector = await getInjector(substrateAccounts.value);
          api?.value?.tx.vesting
            .vest()
            .signAndSend(
              selectedAddress.value,
              {
                signer: injector?.signer,
              },
              (result) => {
                if (result.status.isFinalized) {
                  store.commit('general/setLoading', false);
                } else {
                  showVestingModal.value = false;
                  store.commit('general/setLoading', true);
                }
              }
            )
            .catch((error: Error) => handleVestingError(error));
        }
      } catch (e) {
        handleVestingError(e as Error);
      }
    };

    const unlockVestedTokens = async () => {
      if (isEthWallet.value) {
        await unlockVestedTokensEthExtrinsic();
      } else {
        await unlockVestedTokensSubstrate();
      }
    };

    const showVestingInfo = (): void => {
      showVestingModal.value = true;
    };

    const { defaultUnitToken } = useChainMetadata();
    const { evmDeposit, isEvmDeposit } = useEvmDeposit();
    const { toggleMetaMaskSchema } = useConnectWallet();

    return {
      openWithdrawalModal,
      openFaucetModal,
      openTransferModal,
      unlockVestedTokens,
      evmDeposit,
      isEvmDeposit,
      defaultUnitToken,
      isH160,
      toggleMetaMaskSchema,
      isEthWallet,
      showVestingModal,
      showVestingInfo,
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
.disabled_btn {
  background: #c6d3e1 !important;
}

.btn {
  text-align: center;
}

.transfer-button {
  @apply tw-flex tw-justify-center tw-px-3 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-0.5 xl:tw-w-auto;
  min-width: 96px;
}

.transfer-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}

.small-button {
  @media (min-width: 1280px) {
    width: 120px;
  }
}

.large-button {
  @media (min-width: 1280px) {
    width: 180px;
  }
}
</style>
