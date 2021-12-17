<template>
  <div class="tw-flex tw-flex-col md:tw-flex-row tw-gap-y-8 tw-gap-x-8">
    <template v-if="isMetamask">
      <Account
        :format="AccountFormat.SS58"
        :balance="accountData?.free"
        :is-disable-action="!isTransferable"
      />
      <Account
        :format="AccountFormat.H160"
        :balance="evmDeposit"
        :is-disable-action="!isEvmDeposit"
      />
      <Account
        :format="AccountFormat.Ethereum"
        :balance="accountData?.free"
        :is-disable-action="!isTransferable"
      />
    </template>
    <template v-else>
      <Account
        :format="AccountFormat.SS58"
        :balance="accountData?.free"
        :is-disable-action="!isTransferable"
      />
      <Account
        :format="AccountFormat.H160"
        :balance="evmDeposit"
        :is-disable-action="!isEvmDeposit"
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

  setup(props) {
    const store = useStore();
    const isMetamask = computed(() => store.getters['general/isCheckMetamask']);
    return {
      AccountFormat,
      isMetamask,
    };
  },
});
</script>
