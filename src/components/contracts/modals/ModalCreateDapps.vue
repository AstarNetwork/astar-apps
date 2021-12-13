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
          tw-overflow-hidden
          tw-shadow-xl
          tw-transform
          tw-transition-all
          tw-mx-2
          tw-my-2
          tw-align-middle
          tw-max-w-4xl
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
            {{ $t('contracts.modals.createYourDapps', { step }) }}
          </h3>

          <div
            v-if="step === 1"
            class="sm:tw-flex tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-6"
          >
            <div class="sm:tw-w-1/2">
              <div class="tw-grid tw-grid-cols-1 tw-gap-6">
                <div class="tw-relative">
                  <label
                    class="
                      tw-block tw-text-sm tw-font-medium tw-text-gray-500
                      dark:tw-text-darkGray-400
                      tw-mb-2
                    "
                    >{{ $t('contracts.modals.deploymentAccount') }}</label
                  >

                  <button type="button" class="option-button" @click="openOption = !openOption">
                    <div class="tw-flex tw-items-center tw-justify-between">
                      <div class="tw-flex tw-items-center">
                        <div
                          class="
                            tw-h-8
                            tw-w-8
                            tw-rounded-full
                            tw-overflow-hidden
                            tw-border
                            tw-border-gray-100
                            tw-mr-3
                            tw-flex-shrink-0
                          "
                        >
                          <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
                            <icon-account-sample />
                          </icon-base>
                        </div>
                        <input
                          v-model="toAddress"
                          class="
                            tw-w-full tw-text-blue-900
                            dark:tw-text-darkGray-100
                            tw-text-xl
                            focus:tw-outline-none
                            tw-bg-transparent tw-placeholder-gray-300
                            dark:tw-placeholder-darkGray-600
                          "
                          style="width: 21rem"
                          type="text"
                          spellcheck="false"
                        />
                      </div>
                    </div>

                    <span
                      class="
                        tw-ml-3
                        tw-absolute
                        tw-inset-y-0
                        tw-right-0
                        tw-flex
                        tw-items-center
                        tw-pr-2
                        tw-pointer-events-none
                      "
                    >
                      <icon-base
                        class="tw-h-5 tw-w-5 tw-text-gray-400 dark:tw-text-darkGray-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <icon-solid-selector />
                      </icon-base>
                    </span>
                  </button>

                  <div
                    v-if="openOption"
                    class="
                      tw-block tw-absolute tw-mt-1 tw-w-full tw-rounded-md tw-bg-white
                      dark:tw-bg-darkGray-800
                      tw-shadow-lg tw-z-10 tw-border tw-border-gray-200
                      dark:tw-border-darkGray-600
                    "
                  >
                    <ul
                      class="
                        tw-max-h-56 tw-rounded-md tw-py-1 tw-text-base tw-overflow-auto
                        focus:tw-outline-none
                      "
                    >
                      <ModalSelectAccountOption
                        v-for="(account, index) in allAccounts"
                        :key="index"
                        v-model:selOption="selAccount"
                        :key-idx="index"
                        :address="account"
                        :address-name="allAccountNames[index]"
                        :checked="selAccount === index"
                      />
                    </ul>
                  </div>
                </div>

                <div>
                  <label
                    class="
                      tw-block tw-text-sm tw-font-medium tw-text-gray-500
                      dark:tw-text-darkGray-400
                      tw-mb-2
                    "
                    >{{ $t('contracts.modals.projectName') }}</label
                  >
                  <input
                    v-model="projectName"
                    class="
                      tw-border tw-border-gray-300
                      dark:tw-border-darkGray-500
                      tw-rounded-md tw-w-full tw-text-blue-900
                      dark:tw-text-darkGray-100
                      focus:tw-outline-none
                      tw-placeholder-gray-300
                      dark:tw-placeholder-darkGray-600
                      tw-px-3 tw-py-3 tw-appearance-none tw-bg-white
                      dark:tw-bg-darkGray-900
                    "
                    placeholder
                  />
                </div>

                <input-amount
                  v-model:amount="endowment"
                  v-model:selectedUnit="selectUnitEndowment"
                  title="Endowment"
                  :max-in-default-unit="endowment"
                  :is-max-button="false"
                />

                <div v-if="isInsufficientFee" class="tw-inline-flex tw-text-red-700 tw-text-xs">
                  <!-- Fixme: handle better way to pass the `balance` to translation file as variable  -->
                  {{ $t('contracts.modals.fees.feesOf') }}
                  <balance
                    class="tw-ml-1 tw-mr-1"
                    :balance="partialFee"
                    :decimals="decimal"
                    :unit="defaultUnitToken"
                  />
                  {{ $t('contracts.modals.fees.appliedToSubmission') }}
                </div>

                <input-amount
                  v-model:amount="weight"
                  v-model:selectedUnit="selectUnitGas"
                  title="Max gas allowed"
                  :max-in-default-unit="weight"
                  :is-max-button="false"
                />
              </div>
            </div>

            <div class="sm:tw-w-1/2">
              <div class="tw-grid tw-grid-cols-1 tw-gap-6">
                <div>
                  <label
                    class="
                      tw-block tw-text-sm tw-font-medium tw-text-gray-500
                      dark:tw-text-darkGray-400
                      tw-mb-2
                    "
                    >{{ $t('contracts.modals.contractFile') }}</label
                  >

                  <input-file
                    :file="wasmFromFile"
                    :extension="extensionFile"
                    @dropFile="onDropFile"
                  />
                </div>
                <contract-info :messages="messages" />
              </div>
            </div>
          </div>
          <div v-else class="dark:tw-text-white">
            <params-generator
              v-model:constructorIndex="constructorIndex"
              v-model:params="params"
              :constructors="messages?.filter((msg) => msg.isConstructor)"
            />
          </div>
        </div>

        <div class="tw-mt-6 tw-flex tw-justify-end">
          <button type="button" class="cancel-button" @click="closeModal">
            {{ $t('cancel') }}
          </button>
          <button
            v-if="step === 1"
            type="button"
            :disabled="!canMoveToStep2"
            class="next-step-button"
            :class="{
              'tw-placeholder-opacity-90': !canMoveToStep2,
              'dark-bg-blue': canMoveToStep2,
              'hover:tw-bg-blue-700': canMoveToStep2,
              'tw-cursor-not-allowed': !canMoveToStep2,
            }"
            @click="moveStep2"
          >
            {{ $t('contracts.modals.nextStep') }}
          </button>
          <div v-if="step === 2">
            <button type="button" class="previous-step-button" @click="step = 1">
              {{ $t('contracts.modals.previousStep') }}
            </button>
            <button type="button" class="upload-button" @click="upload">
              {{ $t('contracts.modals.upload') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed, reactive, toRefs } from 'vue';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconSolidSelector from 'components/icons/IconSolidSelector.vue';

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { CodeSubmittableResult } from '@polkadot/api-contract/promise/types';
import type { QueueTx } from 'src/hooks/types/Status';
import BN from 'bn.js';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import ModalSelectAccountOption from 'components/balance/modals/ModalSelectAccountOption.vue';
import InputFile from './InputFile.vue';
import InputAmount from 'components/common/InputAmount.vue';
import Balance from 'components/common/Balance.vue';
import { stringify, isFunction } from '@polkadot/util';
import { SubmittableResult } from '@polkadot/api';
import type { ApiPromise } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import { useApi, useMessages, useWasm, useChainMetadata } from 'src/hooks';
import { useFile, FileState } from 'src/hooks/useFile';
import useAbi from 'src/hooks/useAbi';
import useSendTx from 'src/hooks/signer/useSendTx';
import usePendingTx from 'src/hooks/signer/usePendingTx';
import { AnyJson } from '@polkadot/types/types';
import { AddressProxy } from 'src/hooks/types/Signer';
import { Param } from 'src/hooks/types/Params';
import { getUnit } from 'src/hooks/helper/units';
import { getParamValues } from 'src/hooks/helper/params';
import ContractInfo from './ContractInfo.vue';
import ParamsGenerator from './ParamsGenerator.vue';
import { CodePromise, Abi } from '@polkadot/api-contract';
import { useStore } from 'src/store';

interface FormData {
  endowment: number;
  weight: number;
  projectName: string;
  projectDesc: string;
  webpage: string;
}

export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    IconSolidSelector,
    ModalSelectAccountOption,
    InputFile,
    ContractInfo,
    ParamsGenerator,
    InputAmount,
    Balance,
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
    address: {
      type: String,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const openOption = ref(false);

    const { defaultUnitToken, decimal } = useChainMetadata();

    const selectUnitEndowment = ref<string>(defaultUnitToken.value);
    const selectUnitGas = ref<string>('nano');

    const formData = reactive<FormData>({
      endowment: 0,
      weight: 200,
      projectName: '',
      projectDesc: '',
      webpage: '',
    });

    const selAccount = ref(0);
    const toAccount = ref(props.allAccounts[0] as string);
    const toAddress = ref(props.allAccounts[0] as string);
    const toAccountName = ref(props.allAccountNames[0]);

    watch(
      selAccount,
      () => {
        toAccount.value = props.allAccounts[selAccount.value] as string;
        toAccountName.value = props.allAccountNames[selAccount.value];
        toAddress.value = props.allAccounts[selAccount.value] as string;

        openOption.value = false;
      },
      { immediate: true }
    );

    const shortenToAddress = computed(() => {
      const address = toAccount.value as string;
      return `${address.slice(0, 6)}${'.'.repeat(6)}${address.slice(-6)}`;
    });

    const store = useStore();

    const { api } = useApi();
    const apiPromise: ApiPromise = api?.value as ApiPromise;

    const { abi, onChangeAbi, onRemoveAbi } = useAbi();

    const {
      fileRef: wasmFromFile,
      setFile: setWasmFile,
      validate: isWasmFromFileValid,
    } = useFile({
      onChange: onChangeAbi,
      onRemove: onRemoveAbi,
      validate: (file) => file?.data.subarray(0, 4).toString() === '0,97,115,109',
    });

    const extensionFile = ['.contract', '.json'];

    const onDropFile = (fileState: FileState) => {
      setWasmFile(fileState);
    };

    const { messages } = useMessages(abi);

    const { wasm, isWasmValid } = useWasm(abi, wasmFromFile.value, isWasmFromFileValid);

    const { onSend } = useSendTx();

    const constructorIndex = ref(0);
    const params = ref<(Param | never)[]>([]);
    const partialFee = ref(new BN(0));

    //handlers for transactions
    const _onFailedTx = (result: SubmittableResult | null) => {
      console.error('_onFailed', result);
      store.commit('general/setLoading', false);
      store.dispatch('general/showAlertMsg', {
        msg: result,
        alertType: 'error',
      });
    };

    const _onStartTx = () => {
      console.log('_onStart');
      store.commit('general/setLoading', true);
    };

    const _onSuccessTx = (result: CodeSubmittableResult) => {
      console.log('_onSuccess', result);

      const codeHash = result.blueprint?.codeHash;
      const codeJson = {
        abi: stringify(result.blueprint?.abi.json),
        name: formData.projectName || '<>',
        tags: [],
      };
      console.log('codeHash', codeHash?.toHex());
      console.log('codeJson', codeJson);

      result.blueprint &&
        store.dispatch('contracts/saveCode', {
          api: apiPromise,
          _codeHash: codeHash,
          partial: codeJson,
        });

      result.contract &&
        keyring.saveContract(result.contract.address.toString(), {
          contract: {
            abi: stringify(result.contract.abi.json),
            genesisHash: apiPromise.genesisHash.toHex(),
          },
          name: formData.projectName || '<>',
          tags: [],
        });

      store.commit('general/setLoading', false);
      store.dispatch('general/showAlertMsg', {
        msg: `Success to deploying contract- codeHash: ${codeHash?.toHex()} `,
        alertType: 'success',
      });

      closeModal();
    };
    const _onUpdateTx = () => {
      console.log('_onUpdateTx');
    };

    const curQueueTx = ref<QueueTx>();
    const toEndowment = ref<BN>(new BN(0));

    const pushPendingTx = async () => {
      if (
        formData.projectName === '' ||
        toAddress.value === '' ||
        wasm.value === null ||
        !isWasmValid
      ) {
        store.dispatch('general/showAlertMsg', {
          msg: 'Please check fields again',
          alertType: 'error',
        });
        return;
      }

      const abiData = abi.value as Abi | AnyJson;
      let uploadTx: SubmittableExtrinsic<'promise'> | null = null;

      try {
        const code = new CodePromise(apiPromise, abiData, wasm.value);
        console.log('code', code);

        const unit = getUnit(selectUnitEndowment.value);
        toEndowment.value = plasmUtils.reduceDenomToBalance(
          formData.endowment,
          unit,
          decimal.value
        );
        console.log('toEndowment', toEndowment.value.toString(10));

        const unit2 = getUnit(selectUnitGas.value);
        const toWeight = plasmUtils.reduceDenomToBalance(formData.weight, unit2, decimal.value);
        console.log('toWeight', toWeight.toString(10));

        const defaultParams = abi?.value?.constructors[constructorIndex.value].args;
        console.log('params', defaultParams);

        const arrValues = getParamValues(abi.value?.registry, defaultParams);
        console.log('values', arrValues);

        uploadTx =
          code && abi.value?.constructors[constructorIndex.value].method && formData.endowment
            ? code.tx[abi.value?.constructors[constructorIndex.value].method](
                {
                  gasLimit: toWeight,
                  value: toEndowment.value,
                },
                ...arrValues
              )
            : null;
      } catch (e) {
        const error = (e as Error).message;
        console.error(error);
        store.dispatch('general/showAlertMsg', {
          msg: error,
          alertType: 'error',
        });
        return;
      }

      console.log('uploadTx', uploadTx);

      const { txqueue } = usePendingTx(
        uploadTx,
        toAddress.value,
        _onStartTx,
        _onFailedTx,
        _onSuccessTx,
        _onUpdateTx
      );

      console.log('txQueue', txqueue);

      const currentItem: QueueTx = txqueue[0];

      // set estimation fee of endowment
      if (
        currentItem.accountId &&
        currentItem.extrinsic &&
        isFunction(currentItem.extrinsic.paymentInfo)
      ) {
        try {
          const info = await currentItem.extrinsic?.paymentInfo(currentItem.accountId);

          partialFee.value = info.partialFee.toBn().muln(100);
        } catch (error) {
          console.error(error);
        }
      }

      curQueueTx.value = currentItem;
    };

    const upload = async () => {
      await pushPendingTx();

      const currentItem: QueueTx | undefined = curQueueTx?.value;

      if (currentItem) {
        const senderInfo: AddressProxy = {
          isMultiCall: false,
          isUnlockCached: false,
          multiRoot: null,
          proxyRoot: null,
          signAddress: toAddress.value,
          signPassword: '',
        };
        onSend(currentItem, senderInfo);
      } else {
        console.log("there's no pending tx");
      }
    };

    const step = ref<number>(1);

    const canMoveToStep2 = computed(() => {
      return !!abi.value && formData.projectName && formData.endowment && formData.weight;
    });
    const isInsufficientFee = ref(false);

    const moveStep2 = async () => {
      try {
        await pushPendingTx();
      } catch (e) {
        console.error(e);
        return;
      }

      //set proper endowment automatically - minimum proper amount + 1
      const addOneFee = plasmUtils.reduceDenomToBalance(1, 0, decimal.value);
      const required_endowment = partialFee.value.add(addOneFee);
      console.log('required_endowment', required_endowment.toString(10));

      if (toEndowment.value.lte(required_endowment)) {
        isInsufficientFee.value = true;

        toEndowment.value = required_endowment;
      }

      step.value = 2;
    };

    return {
      ...toRefs(formData),
      closeModal,
      openOption,
      selAccount,
      toAccountName,
      toAddress,
      shortenToAddress,
      upload,
      wasmFromFile,
      extensionFile,
      onDropFile,
      messages,
      step,
      canMoveToStep2,
      constructorIndex,
      params,
      selectUnitEndowment,
      selectUnitGas,
      defaultUnitToken,
      decimal,
      partialFee,
      isInsufficientFee,
      moveStep2,
    };
  },
});
</script>

<style scoped>
.option-button {
  @apply tw-relative tw-text-blue-900 dark:tw-text-darkGray-100 tw-w-full tw-bg-white dark:tw-bg-darkGray-900 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-pl-3 tw-pr-10 tw-py-3 tw-text-left;
}
.option-button:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-800;
}
.option-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-darkGray-600;
}

.cancel-button {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-1;
}
.cancel-button:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.cancel-button:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}

.next-step-button {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-1;
}
.next-step-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}

.previous-step-button {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-1;
}
.previous-step-button:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.previous-step-button:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}

.upload-button {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-1;
}
.upload-button:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}
.upload-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}

.dark-bg-blue:hover {
  @apply tw-bg-blue-400;
}
</style>
