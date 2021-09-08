<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto">
    <div class="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <!-- Background overlay -->
      <div class="tw-fixed tw-inset-0 tw-transition-opacity" aria-hidden="true">
        <div
          class="tw-absolute tw-inset-0 tw-bg-gray-900 dark:tw-bg-black tw-opacity-75"
        ></div>
      </div>

      <div
        class="tw-inline-block tw-bg-white dark:tw-bg-darkGray-900 tw-rounded-lg tw-px-4 sm:tw-px-8 tw-py-10 tw-shadow-xl tw-transform tw-transition-all tw-mx-2 tw-my-2 tw-align-middle tw-max-w-lg tw-w-full"
      >
        <div>
          <q-banner v-if="isShidenChain" dense rounded class="bg-orange text-white tw-mb-4 q-pa-xs" style="">
            Custom sig extrinsic calls has been temporarily blocked
          </q-banner>
          <div>
            <h3
              class="tw-text-lg tw-font-extrabold tw-text-blue-900 dark:tw-text-white tw-mb-6 tw-text-center"
            >
              Transfer {{ defaultUnitToken }}
            </h3>

            <button
              type="button"
              class="tw-w-full tw-bg-blue-500 dark:tw-bg-blue-800 tw-text-white tw-rounded-lg tw-px-5 tw-py-5 tw-mb-4 tw-relative hover:tw-bg-blue-600 dark:hover:tw-bg-blue-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400"
            >
              <span class="tw-block tw-text-left tw-font-bold tw-text-sm mb-2"
                >{{ defaultUnitToken }} Balance</span
              >
              <span class="tw-block tw-font-semibold tw-text-2xl tw-mb-1"
                ><format-balance
              /></span>
            </button>

            <form>
              <div class="tw-mb-4">
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Send from
                </label>

                <modal-select-account
                  :allAccounts="allAccounts"
                  :allAccountNames="allAccountNames"
                  v-model:selAddress="fromAddress"
                  @sel-changed="reloadAmount"
                />
              </div>

              <div class="tw-mb-4">
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Send to
                </label>

                <modal-select-account
                  :allAccounts="allAccounts"
                  :allAccountNames="allAccountNames"
                  v-model:selAddress="toAddress"
                />
              </div>

              <input-amount
                title="Amount"
                :maxInDefaultUnit="formatBalance"
                v-model:amount="transferAmt"
                v-model:selectedUnit="selectUnit"
              />
            </form>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            @click="transfer(transferAmt, fromAddress, toAddress)"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mx-1"
          >
            Confirm
          </button>
          <button
            type="button"
            @click="closeModal"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 tw-mx-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import BN from 'bn.js';
import { useApi, useChainMetadata } from 'src/hooks';
import { web3FromSource } from '@polkadot/extension-dapp';
import { endpointKey } from 'src/config/chainEndpoints';
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { u8aToHex } from '@polkadot/util';
import { u16, u32, TypeRegistry } from '@polkadot/types';
import { AccountInfo } from '@polkadot/types/interfaces';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { getUnit } from 'src/hooks/helper/units';
import ModalSelectAccount from './ModalSelectAccount.vue';
import FormatBalance from 'components/balance/FormatBalance.vue';
import InputAmount from 'components/common/InputAmount.vue';
import { useMetamask } from 'src/hooks/custom-signature/useMetamask';

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
  },
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const openOption = ref(false);

    const store = useStore();

    const { defaultUnitToken, decimal } = useChainMetadata();
    const { requestSignature } = useMetamask();

    const transferAmt = ref(new BN(0));
    const fromAddress = ref('');
    const toAddress = ref('');

    const selectUnit = ref(defaultUnitToken.value);
    const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

    const isShidenChain = currentNetworkIdx.value === endpointKey.SHIDEN;

    const formatBalance = computed(() => {
      const tokenDecimal = decimal.value;
      return plasmUtils.reduceBalanceToDenom(
        props.balance.clone(),
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
    }

    const handleResult = (result: ISubmittableResult): void => {
      const status = result.status;
      if (status.isInBlock) {
        console.log(
          `Completed at block hash #${status.asInBlock.toString()}`
        );

        store.dispatch('general/showAlertMsg', {
          msg: `Completed at block hash #${status.asInBlock.toString()}`,
          alertType: 'success',
        });

        store.commit('general/setLoading', false);
        emit('complete-transfer', true);

        closeModal();
      } else {
        console.log(`Current status: ${status.type}`);

        if (status.type !== 'Finalized') {
          store.commit('general/setLoading', true);
        }
      }
    }

    const transferLocal = async (
      transferAmt: BN,
      fromAddress: string,
      toAddress: string
    ) => {
      try {
        const injector = await web3FromSource('polkadot-js');
        const transfer = await api?.value?.tx.balances.transfer(
          toAddress,
          transferAmt
        );
        //1000000000000004 : 1 PLD
        transfer?.signAndSend(
            fromAddress,
            {
              signer: injector?.signer,
            },
            result => handleResult(result))
          .catch((error: Error) => handleTransactionError(error));
      } catch (e) {
        console.error(e);
      }
    }

    const transferExtrinsic = async (
      transferAmt: BN,
      toAddress: string
    ) => {
      try {
        if (api && api.value) {
          const fn: SubmittableExtrinsicFunction<'promise'> | undefined = api?.value?.tx.balances.transfer;
          
          const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn(
            toAddress,
            transferAmt
          ); 

          api.value.query.system.account(currentEcdsaAccount.value.ss58, async (account: AccountInfo) => {
            const callPayload = u8aToHex(await getPayload(method, account.nonce));

            // Sign transaction with eth private key
            const signature = await requestSignature(callPayload, currentEcdsaAccount.value.ethereum);

            const call = api?.value?.tx.ethCall.call(method, currentEcdsaAccount.value.ss58, signature, account.nonce);
            call
              ?.send((result: ISubmittableResult) => handleResult(result))
              .catch((e: Error) => handleTransactionError(e));
          });
          
        } else {
          console.log('Polkadot.js API is undefined.')
        }
      } catch (e) {
        console.log(e);
      }
    }

    const getPayload = async (method: SubmittableExtrinsic<'promise'>, nonce: u32): Promise<Uint8Array> => {
      const methodPayload: Uint8Array = method.toU8a(true).slice(1);
      const account = currentEcdsaAccount.value.ss58;
      const networkIdx = new u16(new TypeRegistry(), 0xff51);
      let payload = new Uint8Array(0);

      if (nonce) {
        const payloadLength = networkIdx.byteLength() + nonce.byteLength() + methodPayload.byteLength;
        payload = new Uint8Array(payloadLength);
        payload.set(networkIdx.toU8a(), 0);
        payload.set(nonce.toU8a(), networkIdx.byteLength())
        payload.set(methodPayload, networkIdx.byteLength() + nonce.byteLength())
        console.log('p', payload);
      } else {
        store.dispatch('general/showAlertMsg', {
          msg: `Unable to get a nonce for the account: ${account}`,
          alertType: 'error',
        });
      }

      return payload;
    }

    const transfer = async (
      transferAmt: number,
      fromAddress: string,
      toAddress: string
    ) => {
      console.log('transfer', transferAmt);
      console.log('fromAccount', fromAddress);
      console.log('toAccount', toAddress);
      console.log('selUnit', selectUnit.value);

      if (Number(transferAmt) === 0) {
        store.dispatch('general/showAlertMsg', {
          msg: 'The amount of token to be transmitted must not be zero',
          alertType: 'error',
        });
        return;
      } else if (
        !plasmUtils.isValidAddressPolkadotAddress(fromAddress) ||
        !plasmUtils.isValidAddressPolkadotAddress(toAddress)
      ) {
        store.dispatch('general/showAlertMsg', {
          msg: 'The address is not valid',
          alertType: 'error',
        });
        return;
      }

      const unit = getUnit(selectUnit.value);
      const toAmt = plasmUtils.reduceDenomToBalance(
        transferAmt,
        unit,
        decimal.value
      );
      console.log('toAmt', toAmt.toString(10));

      if (isCheckMetamask.value) {
        await transferExtrinsic(toAmt, toAddress);
      } else {
        await transferLocal(toAmt, fromAddress, toAddress);
      }
    };

    const reloadAmount = (address: string, isMetamaskChecked:boolean, selAccountIdx: number): void => {
      store.commit('general/setIsCheckMetamask', isMetamaskChecked);
      store.commit('general/setCurrentAccountIdx', selAccountIdx);
    }

    return {
      closeModal,
      isShidenChain,
      transfer,
      formatBalance,
      fromAddress,
      toAddress,
      openOption,
      transferAmt,
      defaultUnitToken,
      selectUnit,
      reloadAmount
    };
  },
});
</script>
