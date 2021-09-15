/* eslint-disable vue/no-setup-props-destructure */
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
        class="tw-inline-block tw-bg-white dark:tw-bg-darkGray-900 tw-rounded-lg tw-px-4 sm:tw-px-8 tw-py-10 tw-overflow-hidden tw-shadow-xl tw-transform tw-transition-all tw-mx-2 tw-my-2 tw-align-middle tw-max-w-lg tw-w-full"
      >
        <div>
          <div>
            <h3
              class="tw-text-lg tw-font-extrabold tw-text-blue-900 dark:tw-text-white tw-mb-6 tw-text-center"
            >
              Call a Contract
            </h3>

            <div class="tw-grid tw-grid-cols-1 tw-gap-6">
              <div>
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Contract to use:
                </label>
                <input
                  class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 focus:tw-outline-none tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-px-3 tw-py-3 tw-appearance-none tw-bg-white dark:tw-bg-darkGray-900"
                  placeholder="A deployed contract that has either been deployed or attached."
                  disabled
                  :value="contract.address"
                />
              </div>

              <div>
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Call from account
                </label>

                <button
                  type="button"
                  @click="openOption = !openOption"
                  class="tw-relative tw-text-blue-900 dark:tw-text-darkGray-100 tw-w-full tw-bg-white dark:tw-bg-darkGray-900 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-pl-3 tw-pr-10 tw-py-3 tw-text-left focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-darkGray-600 hover:tw-bg-gray-50 dark:hover:tw-bg-darkGray-800"
                >
                  <div class="tw-flex tw-items-center tw-justify-between">
                    <div class="tw-flex tw-items-center">
                      <div
                        class="tw-h-8 tw-w-8 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mr-3 tw-flex-shrink-0"
                      >
                        <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
                          <icon-account-sample />
                        </icon-base>
                      </div>
                      <input
                        class="tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 tw-text-xl focus:tw-outline-none tw-bg-transparent tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600"
                        style="width: 21rem"
                        type="text"
                        spellcheck="false"
                        v-model="toAddress"
                      />
                    </div>
                  </div>

                  <span
                    class="tw-ml-3 tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-2 tw-pointer-events-none"
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
                  class="tw-block tw-absolute tw-mt-1 tw-w-full tw-rounded-md tw-bg-white dark:tw-bg-darkGray-800 tw-shadow-lg tw-z-10 tw-border tw-border-gray-200 dark:tw-border-darkGray-600"
                >
                  <ul
                    class="tw-max-h-56 tw-rounded-md tw-py-1 tw-text-base tw-overflow-auto focus:tw-outline-none"
                  >
                    <ModalSelectAccountOption
                      v-for="(account, index) in allAccounts"
                      :key="index"
                      :key-idx="index"
                      :address="account"
                      :addressName="allAccountNames[index]"
                      :checked="selAccount === index"
                      v-model:selOption="selAccount"
                    />
                  </ul>
                </div>
              </div>

              <div>
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Message to send
                </label>

                <input
                  class="tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 tw-text-xl focus:tw-outline-none tw-bg-transparent tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600"
                  style="width: 21rem"
                  type="text"
                  spellcheck="false"
                  disabled
                  v-model="messageMethod"
                />
              </div>

              <input-amount
                v-if="isPayable"
                title="Value"
                :noMax="true"
                :maxInDefaultUnit="endowment"
                v-model:amount="endowment"
                v-model:selectedUnit="selectUnitEndowment"
              />

              <input-amount
                title="Max gas allowed"
                :noMax="true"
                :maxInDefaultUnit="weight"
                v-model:amount="weight"
                v-model:selectedUnit="selectUnitGas"
              />
            </div>
            <div v-if="outcomes" class="tw-mt-5">
              <label
                class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
              >
                Outcome
              </label>
              <ul
                class="tw-max-h-56 tw-rounded-md tw-py-1 tw-text-base tw-overflow-auto focus:tw-outline-none"
              >
                <li v-for="(outcome, index) in outcomes" :key="`outcome-${index}`">
                  <div v-if="outcome.result.isOk" class="tw-text-blue-700 tw-text-sm">
                    {{ outcome.output }}
                  </div>
                  <div v-else class="tw-text-red-700 tw-text-sm">
                    {{ outcome.result }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            @click="readCallRpc"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mx-1"
          >
            Read
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
import { defineComponent, ref, reactive, watch, toRefs, computed } from 'vue';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import type { CallResult } from 'src/hooks/types/Contracts';
import { useStore } from 'src/store';
import BN from 'bn.js';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { getUnit } from 'src/hooks/helper/units';
import { ContractPromise } from '@polkadot/api-contract';
import { useChainMetadata } from 'src/hooks';
import ModalSelectAccountOption from 'components/balance/modals/ModalSelectAccountOption.vue';
import InputAmount from 'components/common/InputAmount.vue';

interface FormData {
  endowment: number;
  weight: number;
}

export default defineComponent({
  props: {
    contract: {
      type: ContractPromise,
      required: true,
    },
    messageIndex: {
      type: Number,
      required: true,
      default: 0
    }
  },
  components: {
    ModalSelectAccountOption,
    InputAmount,
    IconBase,
    IconAccountSample
  },
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const { defaultUnitToken, decimal } = useChainMetadata();

    const selectUnitEndowment = ref<string>(defaultUnitToken.value);
    const selectUnitGas = ref<string>('nano');

    const formData = reactive<FormData>({
      endowment: 0,
      weight: 200,
    });

    const store = useStore();
    const allAccounts = computed(() => store.getters['general/allAccounts']);
    const allAccountNames = computed(() => store.getters['general/allAccountNames']);

    const openOption = ref(false);
    const selAccount = ref(0);
    const toAccount = ref(allAccounts.value[0] as string);
    const toAddress = ref(allAccounts.value[0] as string);
    const toAccountName = ref(allAccountNames.value[0]);

    watch(
      selAccount,
      () => {
        toAccount.value = allAccounts.value[selAccount.value] as string;
        toAccountName.value = allAccountNames.value[selAccount.value];
        toAddress.value = allAccounts.value[selAccount.value] as string;

        openOption.value = false;
      },
      { immediate: true }
    );

    const outcomes = ref<CallResult[]>();
    // eslint-disable-next-line vue/no-setup-props-destructure
    const message = props.contract.abi.messages[props.messageIndex];
    const messageMethod = message.method;
    const isPayable = message.isPayable;

    const readCallRpc = () => {
      const params: any[] = message ? message.args : [];
      console.log('message', message)
      console.log('form', formData)

      const unit = getUnit('nano');
      const toWeight = plasmUtils.reduceDenomToBalance(
        formData.weight,
        unit,
        decimal.value
      );
      console.log('toWeight', toWeight.toString(10));

      props.contract
        .query[message.method](toAccount.value, {
          gasLimit: toWeight,
          value: isPayable? formData.endowment : 0
        }, ...params)
        .then((result): void => {
          console.log('result', result)
          const arrOutcomes = outcomes.value ? outcomes.value : [];
          outcomes.value = [{
            ...result,
            from: toAccount.value,
            message,
            params,
            when: new Date()
          }, ...arrOutcomes];

          emit('callResult', result);
        })
        .catch((error): void => {
          console.error(error);
        });
    }

    return {
      ...toRefs(formData),
      closeModal,
      openOption,
      allAccounts,
      allAccountNames,
      toAddress,
      messageMethod,
      selAccount,
      selectUnitEndowment,
      selectUnitGas,
      isPayable,
      readCallRpc,
      outcomes
    };
  },
});
</script>
