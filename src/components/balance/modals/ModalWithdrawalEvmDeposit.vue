<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto">
    <div class="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <!-- Background overlay -->
      <div class="tw-fixed tw-inset-0 tw-transition-opacity" aria-hidden="true">
        <div class="tw-absolute tw-inset-0 tw-bg-gray-900 dark:tw-bg-black tw-opacity-75"></div>
      </div>

      <div
        class="
          tw-inline-block tw-bg-white
          dark:tw-bg-darkGray-900
          tw-rounded-lg tw-px-4
          sm:tw-px-8
          tw-py-10
          tw-shadow-xl
          tw-transform
          tw-transition-all
          tw-mx-2
          tw-my-2
          tw-align-middle
          tw-max-w-lg
          tw-w-full
        "
      >
        <div>
          <h3
            class="
              tw-text-lg tw-font-extrabold tw-text-blue-900
              dark:tw-text-white
              tw-mb-6 tw-text-center
            "
          >
            {{ $t('balance.modals.withdrawalToken', { token: defaultUnitToken }) }}
          </h3>

          <div class="withdrawal-balance">
            <span class="tw-block tw-text-left tw-font-bold tw-text-sm mb-2">{{
              $t('balance.modals.withdrawableBalance', {
                token: defaultUnitToken,
              })
            }}</span>
            <span class="tw-block tw-font-semibold tw-text-2xl tw-mb-1 tw-text-center">
              <format-balance :balance="balance" />
            </span>
          </div>

          <form>
            <div class="tw-mb-4">
              <label
                class="
                  tw-block tw-text-sm tw-font-medium tw-text-gray-500
                  dark:tw-text-darkGray-400
                  tw-mb-2
                "
                >{{ $t('balance.modals.withdrawnFrom') }}</label
              >

              <div class="tw-relative">
                <div class="account">
                  <div class="tw-flex tw-items-center tw-justify-between">
                    <div class="tw-flex tw-items-center">
                      <div class="tw-h-8 tw-w-8 tw-overflow-hidden tw-mr-3 tw-flex-shrink-0">
                        <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
                          <icon-account-sample />
                        </icon-base>
                      </div>

                      <input
                        v-model="acName"
                        class="
                          tw-w-full tw-text-blue-900
                          dark:tw-text-darkGray-100
                          tw-text-xl
                          focus:tw-outline-none
                          tw-bg-transparent tw-placeholder-gray-300
                          dark:tw-placeholder-darkGray-600
                        "
                        style="'width: 21rem'"
                        type="text"
                        spellcheck="false"
                        :readonly="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <input-amount
              v-model:amount="withdrawAmount"
              v-model:selectedUnit="selectUnit"
              title="Amount"
              :max-in-default-unit="formatBalance"
              :is-max-button="true"
            />
          </form>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button type="button" class="confirm" @click="sendTransaction(withdrawAmount)">
            {{ $t('confirm') }}
          </button>
          <button type="button" class="cancel" @click="closeModal">
            {{ $t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { web3FromSource } from '@polkadot/extension-dapp';
import { ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import FormatBalance from 'components/balance/FormatBalance.vue';
import InputAmount from 'components/common/InputAmount.vue';
import { useApi, useChainMetadata } from 'src/hooks';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { getUnit } from 'src/hooks/helper/units';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { useExtrinsicCall } from 'src/hooks/custom-signature/useExtrinsicCall';
export default defineComponent({
  components: {
    FormatBalance,
    InputAmount,
    IconBase,
    IconAccountSample,
  },
  props: {
    account: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
      default: '',
    },
    balance: {
      type: BN,
      required: true,
      default: new BN(0),
    },
  },
  emits: ['update:is-open'],

  setup({ balance, account, accountName }, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const openOption = ref(false);
    const store = useStore();
    const { api } = useApi();
    const { defaultUnitToken, decimal } = useChainMetadata();
    const withdrawAmount = ref(new BN(0));
    const selectUnit = ref(defaultUnitToken.value);
    const acName = accountName;
    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);

    const formatBalance = computed(() => {
      const tokenDecimal = decimal.value;
      return plasmUtils.defaultAmountWithDecimals(balance, tokenDecimal);
    });

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
        const msg = `Completed at block hash #${status.asInBlock.toString()}`;

        store.dispatch('general/showAlertMsg', {
          msg,
          alertType: 'success',
        });

        store.commit('general/setLoading', false);
        closeModal();
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

    const transferExtrinsic = async ({ amount, account }: { amount: BN; account: string }) => {
      try {
        const h160Addr = plasmUtils.toEvmAddress(account);

        const fn: SubmittableExtrinsicFunction<'promise'> | undefined = api?.value?.tx.evm.withdraw;
        const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn(h160Addr, amount);

        method && callFunc(method);
      } catch (e) {
        console.error(e);
        store.dispatch('general/showAlertMsg', {
          msg: (e as Error).message,
          alertType: 'error',
        });
      }
    };

    const withdraw = async ({ amount, account }: { amount: BN; account: string }) => {
      try {
        if (!api || !api.value) {
          throw Error('Cannot connect to the API');
        }

        const injector = await web3FromSource('polkadot-js');
        if (!injector) {
          throw Error('Cannot reach to the injector');
        }

        const h160Addr = plasmUtils.toEvmAddress(account);
        const transaction = await api.value.tx.evm.withdraw(h160Addr, amount);
        if (!transaction) {
          throw Error('Cannot withdraw the deposit');
        }

        transaction
          .signAndSend(
            account,
            {
              signer: injector.signer,
            },
            (result) => handleResult(result)
          )
          .catch((error: Error) => handleTransactionError(error));
      } catch (e) {
        console.error(e);
      }
    };

    const sendTransaction = async (amount: number) => {
      if (Number(amount) === 0) {
        store.dispatch('general/showAlertMsg', {
          msg: 'The amount of token to be transmitted must not be zero',
          alertType: 'error',
        });
        return;
      }

      const unit = getUnit(selectUnit.value);
      const toAmt = plasmUtils.reduceDenomToBalance(amount, unit, decimal.value);
      if (isCheckMetamask.value) {
        await transferExtrinsic({ amount: toAmt, account });
      } else {
        await withdraw({ amount: toAmt, account });
      }
    };

    const reloadAmount = (
      address: string,
      isMetamaskChecked: boolean,
      selAccountIdx: number
    ): void => {
      store.commit('general/setIsCheckMetamask', isMetamaskChecked);
      store.commit('general/setCurrentAccountIdx', selAccountIdx);
    };

    return {
      closeModal,
      sendTransaction,
      formatBalance,
      openOption,
      withdrawAmount,
      defaultUnitToken,
      selectUnit,
      reloadAmount,
      acName,
    };
  },
});
</script>

<style scoped>
.withdrawal-balance {
  @apply tw-w-full tw-bg-blue-500 dark:tw-bg-blue-800 tw-text-white tw-rounded-lg tw-px-5 tw-py-5 tw-mb-4 tw-relative;
}
.withdrawal-balance:hover {
  @apply tw-bg-blue-600 dark:tw-bg-blue-700;
}
.withdrawal-balance:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
.confirm {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500  tw-mx-1;
}
.confirm:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}
.confirm:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
.cancel {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-1;
}
.cancel:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.cancel:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
.account {
  @apply tw-relative tw-text-blue-900 dark:tw-text-darkGray-100 tw-w-full tw-bg-white dark:tw-bg-darkGray-900 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-pl-3 tw-pr-10 tw-py-3 tw-text-left;
}
.account:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-800;
}
.account:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-darkGray-600;
}
</style>
