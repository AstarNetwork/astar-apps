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
          <q-banner
            v-if="isCustomSigBlocked"
            dense
            rounded
            class="bg-orange text-white tw-mb-4 q-pa-xs"
            style
            >{{ $t('balance.modals.sigExtrinsicBlocked') }}</q-banner
          >
          <div>
            <h3
              class="
                tw-text-lg tw-font-extrabold tw-text-blue-900
                dark:tw-text-white
                tw-mb-6 tw-text-center
              "
            >
              {{ $t('balance.modals.transferToken', { token: defaultUnitToken }) }}
            </h3>

            <button type="button" class="transfer-button">
              <span class="tw-block tw-text-left tw-font-bold tw-text-sm mb-2">{{
                $t('balance.modals.transferableBalance', {
                  token: defaultUnitToken,
                })
              }}</span>
              <span class="tw-block tw-font-semibold tw-text-2xl tw-mb-1">
                <format-balance :balance="accountData?.getUsableTransactionBalance()" />
              </span>
            </button>

            <form>
              <div class="tw-mb-4">
                <label
                  class="
                    tw-block tw-text-sm tw-font-medium tw-text-gray-500
                    dark:tw-text-darkGray-400
                    tw-mb-2
                  "
                  >{{ $t('balance.modals.sendFrom') }}</label
                >

                <modal-select-account
                  v-model:selAddress="fromAddress"
                  :all-accounts="allAccounts"
                  :all-account-names="allAccountNames"
                  :role="Role.FromAddress"
                  @sel-changed="reloadAmount"
                />
              </div>

              <div class="tw-mb-4">
                <label
                  class="
                    tw-block tw-text-sm tw-font-medium tw-text-gray-500
                    dark:tw-text-darkGray-400
                    tw-mb-2
                  "
                  >{{ $t('balance.modals.sendTo') }}</label
                >

                <modal-select-account
                  v-model:selAddress="toAddress"
                  :all-accounts="allAccounts"
                  :all-account-names="allAccountNames"
                  :role="Role.ToAddress"
                  :to-address="toAddress"
                />
              </div>

              <input-amount
                v-model:amount="transferAmt"
                v-model:selectedUnit="selectUnit"
                title="Amount"
                :max-in-default-unit="formatBalance"
                :is-max-button="false"
              />
            </form>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            :disabled="!canExecuteTransaction"
            class="confirm"
            @click="transfer(transferAmt, fromAddress, toAddress)"
          >
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
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { web3FromSource } from '@polkadot/extension-dapp';
import { ISubmittableResult } from '@polkadot/types/types';
import BN from 'bn.js';
import FormatBalance from 'components/balance/FormatBalance.vue';
import InputAmount from 'components/common/InputAmount.vue';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useApi, useChainMetadata } from 'src/hooks';
import { useExtrinsicCall } from 'src/hooks/custom-signature/useExtrinsicCall';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { getUnit } from 'src/hooks/helper/units';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, toRefs } from 'vue';
import Web3 from 'web3';
import ModalSelectAccount from './ModalSelectAccount.vue';

export enum Role {
  FromAddress = 'FromAddress',
  ToAddress = 'ToAddress',
}

export default defineComponent({
  components: {
    ModalSelectAccount,
    FormatBalance,
    InputAmount,
  },
  props: {
    allAccounts: {
      type: Array,
      required: true,
    },
    allAccountNames: {
      type: Array,
      required: true,
    },
    balance: {
      type: BN,
      required: true,
    },
    accountData: {
      type: Object,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const openOption = ref(false);

    const store = useStore();

    const { defaultUnitToken, decimal } = useChainMetadata();

    const transferAmt = ref(new BN(0));
    const fromAddress = ref('');
    const toAddress = ref('');

    const selectUnit = ref(defaultUnitToken.value);
    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    // isCustomSigBlocked is temporary until extrinsic call pallet is deployed to all networks.
    const isCustomSigBlocked = computed(() => !!!providerEndpoints[currentNetworkIdx.value].prefix);
    const canExecuteTransaction = computed(() =>
      isCheckMetamask.value ? !isCustomSigBlocked.value : true
    );

    const formatBalance = computed(() => {
      const tokenDecimal = decimal.value;
      return plasmUtils.reduceBalanceToDenom(
        props.accountData.getUsableTransactionBalance(),
        tokenDecimal
      );
    });

    const { api } = useApi();

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
        console.log(msg);

        store.dispatch('general/showAlertMsg', {
          msg,
          alertType: 'success',
        });

        store.commit('general/setLoading', false);
        closeModal();
      } else {
        console.log(`Current status: ${status.type}`);

        if (status.type !== 'Finalized') {
          store.commit('general/setLoading', true);
        }
      }
    };

    const { callFunc } = useExtrinsicCall({
      onResult: handleResult,
      onTransactionError: handleTransactionError,
    });

    const transferLocal = async (transferAmt: BN, fromAddress: string, toAddress: string) => {
      try {
        const injector = await web3FromSource('polkadot-js');
        const transfer = await api?.value?.tx.balances.transfer(toAddress, transferAmt);
        transfer
          ?.signAndSend(
            fromAddress,
            {
              signer: injector?.signer,
            },
            (result) => handleResult(result)
          )
          .catch((error: Error) => handleTransactionError(error));
      } catch (e) {
        console.error(e);
      }
    };

    const transferExtrinsic = async (transferAmt: BN, toAddress: string) => {
      try {
        const fn: SubmittableExtrinsicFunction<'promise'> | undefined =
          api?.value?.tx.balances.transfer;
        const method: SubmittableExtrinsic<'promise'> | undefined =
          fn && fn(toAddress, transferAmt);

        method && callFunc(method);
      } catch (e) {
        console.error(e);
        store.dispatch('general/showAlertMsg', {
          msg: (e as Error).message,
          alertType: 'error',
        });
      }
    };

    const transfer = async (transferAmt: number, fromAddress: string, toAddress: string) => {
      console.log('transfer', transferAmt);
      console.log('fromAccount', fromAddress);
      console.log('toAccount', toAddress);
      console.log('selUnit', selectUnit.value);

      const toastInvalidAddress = () =>
        store.dispatch('general/showAlertMsg', {
          msg: 'balance.modals.invalidAddress',
          alertType: 'error',
        });

      if (Number(transferAmt) === 0) {
        store.dispatch('general/showAlertMsg', {
          msg: 'The amount of token to be transmitted must not be zero',
          alertType: 'error',
        });
        return;
      }

      if (isH160.value) {
        const provider = typeof window !== 'undefined' && window.ethereum;
        const web3 = new Web3(provider as any);
        if (!web3.utils.isAddress(toAddress)) {
          toastInvalidAddress();
          return;
        }
        store.commit('general/setLoading', true);
        try {
          await web3.eth
            .sendTransaction({
              to: toAddress,
              from: fromAddress,
              value: web3.utils.toWei(String(transferAmt), 'ether'),
            })
            .once('confirmation', (confNumber, receipt) => {
              const hash = receipt.transactionHash;
              const msg = `Completed at transaction hash #${hash}`;
              store.dispatch('general/showAlertMsg', { msg, alertType: 'success' });
              store.commit('general/setLoading', false);
              closeModal();
            });
        } catch (error) {
          console.error(error);
          store.commit('general/setLoading', false);
        }

        return;
      }

      const isValidSS58Address =
        plasmUtils.isValidAddressPolkadotAddress(fromAddress) &&
        plasmUtils.isValidAddressPolkadotAddress(toAddress);

      if (!isValidSS58Address && !plasmUtils.isValidEvmAddress(toAddress)) {
        toastInvalidAddress();
        return;
      }

      const receivingAddress = plasmUtils.isValidEvmAddress(toAddress)
        ? plasmUtils.toSS58Address(toAddress)
        : toAddress;
      console.log('receivingAddress', receivingAddress);

      const unit = getUnit(selectUnit.value);
      const toAmt = plasmUtils.reduceDenomToBalance(transferAmt, unit, decimal.value);
      console.log('toAmt', toAmt.toString(10));

      if (isCheckMetamask.value) {
        await transferExtrinsic(toAmt, receivingAddress);
      } else {
        await transferLocal(toAmt, fromAddress, receivingAddress);
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
      isCustomSigBlocked,
      canExecuteTransaction,
      transfer,
      formatBalance,
      fromAddress,
      toAddress,
      openOption,
      transferAmt,
      defaultUnitToken,
      selectUnit,
      reloadAmount,
      Role,
      ...toRefs(props),
    };
  },
});
</script>

<style scoped>
.transfer-button {
  @apply tw-w-full tw-bg-blue-500 dark:tw-bg-blue-800 tw-text-white tw-rounded-lg tw-px-5 tw-py-5 tw-mb-4 tw-relative;
}
.transfer-button:hover {
  @apply tw-bg-blue-600 dark:tw-bg-blue-700;
}
.transfer-button:focus {
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
</style>
