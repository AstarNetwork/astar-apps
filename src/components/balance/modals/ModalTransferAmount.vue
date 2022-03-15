<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto" @click="closeModal">
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
        @click.stop
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
          <q-banner
            v-if="isEthWallet"
            dense
            rounded
            class="bg-orange text-white tw-mb-4 q-pa-xs"
            style
            >{{ $t('balance.modals.evmModeWarning') }}</q-banner
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
                  :role="Role.ToAddress"
                  :to-address="toAddress"
                />
                <div
                  class="
                    tw-flex tw-gap-2 tw-justify-end tw-mt-1 tw-text-gray-500
                    dark:tw-text-darkGray-400
                  "
                >
                  <span>{{ $t('balance.modals.destBalance') }}</span>
                  <FormatBalance :balance="toAddressBalance" />
                </div>
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
        <div
          v-if="isH160"
          class="tw-flex tw-items-center tw-mt-6 tw-p-3 tw-pb-4 tw-rounded-md tw-border"
          :class="[
            isChecked && 'tw-bg-blue-500 dark:tw-bg-blue-800',
            isChecked ? 'tw-border-transparent' : 'tw-border-gray-300 dark:tw-border-darkGray-500',
          ]"
        >
          <label class="form-check-input">
            <input v-model="isChecked" type="checkbox" :class="isDarkTheme && 'input-dark'" />
            <span
              class="
                tw-inline-block tw-whitespace-nowrap tw-ml-1
                sm:tw-ml-4
                dark:tw-text-white
                text-not-sending
              "
              :class="isChecked ? 'tw-text-white' : 'tw-text-gray-800'"
            >
              {{ $t('balance.modals.notSendToExchanges') }}
            </span>
          </label>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            :disabled="!canExecuteTransaction || (isH160 && !isChecked)"
            class="confirm"
            @click="transfer"
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
import BN from 'bn.js';
import FormatBalance from 'components/balance/FormatBalance.vue';
import InputAmount from 'components/common/InputAmount.vue';
import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { useChainMetadata, useTransfer } from 'src/hooks';
import { $api } from 'boot/api';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { reduceBalanceToDenom } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, toRefs, watchEffect, watch } from 'vue';
import Web3 from 'web3';
import ModalSelectAccount from './ModalSelectAccount.vue';
import { createWeb3Instance } from 'src/config/web3';
import { AccountInfo } from '@polkadot/types/interfaces';

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

    const openOption = ref<boolean>(false);
    const isChecked = ref<boolean>(false);
    const web3 = ref<Web3 | undefined>(undefined);
    const store = useStore();
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');

    const { defaultUnitToken, decimal } = useChainMetadata();

    const transferAmt = ref<BN>(new BN(0));
    const fromAddress = ref<string>('');
    const toAddress = ref<string>('');
    const toAddressBalance = ref<BN>(new BN(0));

    const selectUnit = ref(defaultUnitToken.value);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    // isCustomSigBlocked is temporary until extrinsic call pallet is deployed to all networks.
    const isCustomSigBlocked = computed(() => !!!providerEndpoints[currentNetworkIdx.value].prefix);
    const canExecuteTransaction = computed(() =>
      isEthWallet.value ? !isCustomSigBlocked.value : true
    );

    const formatBalance = computed(() => {
      const tokenDecimal = decimal.value;
      return reduceBalanceToDenom(props.accountData.getUsableTransactionBalance(), tokenDecimal);
    });

    const { callTransfer } = useTransfer(selectUnit, decimal, closeModal);

    const transfer = () => {
      if (Number(transferAmt.value) === 0) {
        store.dispatch('general/showAlertMsg', {
          msg: 'The amount of token to be transmitted must not be zero',
          alertType: 'error',
        });
        return;
      }

      callTransfer(Number(transferAmt.value), fromAddress.value, toAddress.value);
    };

    const reloadAmount = (address: string): void => {
      store.commit('general/setCurrentAddress', address);
    };

    watch(
      [currentNetworkIdx],
      async () => {
        web3.value = await createWeb3Instance(currentNetworkIdx.value);
      },
      { immediate: true }
    );

    watchEffect(async () => {
      const toAddressRef = toAddress.value;
      const web3Ref = web3.value;
      const apiRef = $api.value;
      if (!apiRef || !toAddressRef) return;
      if (plasmUtils.isValidAddressPolkadotAddress(toAddressRef)) {
        const { data } = await apiRef.query.system.account<AccountInfo>(toAddressRef);
        toAddressBalance.value = data.free;
        return;
      }
      if (web3Ref && web3Ref.utils.isAddress(toAddressRef)) {
        toAddressBalance.value = new BN(await web3Ref.eth.getBalance(toAddressRef));
        return;
      }
    });

    return {
      closeModal,
      isCustomSigBlocked,
      canExecuteTransaction,
      transfer,
      formatBalance,
      fromAddress,
      toAddress,
      transferAmt,
      defaultUnitToken,
      selectUnit,
      reloadAmount,
      Role,
      isEthWallet,
      isChecked,
      isH160,
      isDarkTheme,
      toAddressBalance,
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

#checkb {
  width: 20px;
  height: 20px;
  cursor: pointer;
  background: rgba(40, 40, 40, 0.2);
  color: black;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  position: relative;
  left: -5px;
  top: -5px;
}

#checkb:checked {
  background: rgba(40, 40, 40, 0.7);
}

.checkbox-container {
  position: absolute;
  display: inline-block;
  margin: 20px;
  width: 100px;
  height: 100px;
  overflow: hidden;
}

.form-check-input {
  cursor: pointer;
  position: relative;
  display: flex;
  justify-items: center;
  align-items: center;
}

.form-check-input > span {
  padding: 0.5rem 0.25rem;
}

.form-check-input > input {
  height: 24px;
  width: 24px;
  -webkit-appearance: none;
  -moz-appearance: none;
  -o-appearance: none;
  appearance: none;
  border-radius: 4px;
  outline: none;
  transition-duration: 0.3s;
  cursor: pointer;
  border: 1px solid rgba(174, 192, 212, 1);
}

.input-dark {
  border: 1px solid white;
}

.form-check-input > input:checked {
  border: 1px solid white;
  background-color: transparent;
}

.form-check-input > input:checked + span::before {
  content: '\2713';
  display: block;
  text-align: center;
  color: white;
  position: absolute;
  font-weight: 800;
  left: 5px;
  top: 7px;
}

.text-not-sending {
  font-size: 16px;
  font-weight: 500;
  padding-top: 3px;
}
</style>
