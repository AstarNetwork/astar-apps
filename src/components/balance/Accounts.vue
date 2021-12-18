<template>
  <div class="tw-flex tw-flex-col md:tw-flex-row tw-gap-y-8 tw-gap-x-8">
    <template v-if="isMetamask">
      <Account
        :format="AccountFormat.SS58"
        :balance="accountData?.free"
        :is-disable-action="!isTransferable"
        :open-modal="openTransferModal"
      />
      <Account
        :format="AccountFormat.H160"
        :balance="evmDeposit"
        :is-disable-action="!isEvmDeposit"
        :open-modal="openWithdrawalModal"
      />
      <Account
        :format="AccountFormat.Ethereum"
        :balance="accountData?.ethereumBalance"
        :is-disable-action="!isTransferable"
        :open-modal="openTransferEthereumModal"
      />
    </template>
    <template v-else>
      <Account
        :format="AccountFormat.SS58"
        :balance="accountData?.free"
        :is-disable-action="!isTransferable"
        :open-modal="openTransferModal"
      />
      <Account
        :format="AccountFormat.H160"
        :balance="evmDeposit"
        :is-disable-action="!isEvmDeposit"
        :open-modal="openWithdrawalModal"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { useAccount, useApi, useBalance, useEvmDeposit } from 'src/hooks';
import { defineComponent, computed, watchEffect } from 'vue';
import { useStore } from 'src/store';
import Account from './Account.vue';
import BN from 'bn.js';
export enum AccountFormat {
  SS58 = 'SS58',
  H160 = 'H160',
  Ethereum = 'Ethereum',
}

export default defineComponent({
  components: {
    Account,
  },
  props: {
    currentAccount: {
      type: String,
      required: true,
    },
    accountData: {
      type: Object,
      required: true,
    },
    isEvmDeposit: {
      type: Boolean,
      required: true,
    },
    isTransferable: {
      type: Boolean,
      required: true,
    },
    evmDeposit: {
      type: BN,
      required: true,
    },
  },
  emits: [
    'update:is-open-transfer',
    'update:is-open-transfer-ethereum',
    'update:is-open-withdrawal-evm-deposit',
  ],
  setup(props, { emit }) {
    const store = useStore();
    const isMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const openTransferModal = (): void => {
      emit('update:is-open-transfer', true);
    };

    const openTransferEthereumModal = (): void => {
      emit('update:is-open-transfer-ethereum', true);
    };

    const openWithdrawalModal = (): void => {
      emit('update:is-open-withdrawal-evm-deposit', true);
    };

    return {
      AccountFormat,
      isMetamask,
      openTransferModal,
      openWithdrawalModal,
      openTransferEthereumModal,
    };
  },
});
</script>
