<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-overflow-hidden tw-shadow tw-rounded-lg tw-text-blue-900
      dark:tw-text-darkGray-100
      tw-py-5 tw-px-5 tw-w-62
      md:tw-w-72
    "
  >
    <div class="row">
      <div v-if="accountName === accountLabel.ss58" class="tw-h-10 tw-w-10 tw-overflow-hidden">
        <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
          <icon-account-sample />
        </icon-base>
      </div>
      <div v-else>
        <img width="40" src="~assets/img/ethereum.png" />
      </div>
      <div class="tw-justify-self-center tw-font-semibold tw-text-lg">{{ $t(accountName) }}</div>
      <div v-if="isSubscan" class="tw-justify-self-end">
        <a :href="subScan" target="_blank" rel="noopener noreferrer">
          <button type="button" class="icon tw-tooltip">
            <icon-base
              class="dark:tw-text-darkGray-300 tw-h-5 tw-w-5 tw-mt-1"
              viewBox="0 0 30 40"
              aria-hidden="true"
            >
              <icon-link />
            </icon-base>

            <!-- Tooltip -->
            <span
              class="
                tw-pointer-events-none
                tw-hidden
                tw-absolute
                tw-top-0
                tw-left-1/2
                tw-z-10
                tw-transform
                tw--translate-y-full
                tw--translate-x-1/2
                tw-p-1
                tw-text-xs
                tw-leading-tight
                tw-text-white
                tw-bg-gray-800
                dark:tw-bg-darkGray-500
                tw-rounded-md tw-shadow-lg tw-whitespace-nowrap
              "
              >{{ $t('subscan') }}</span
            >
          </button>
        </a>
      </div>
    </div>
    <div class="tw-flex tw-justify-between tw-mt-4">
      <div>{{ $t('balance.totalBalance') }}</div>
      <div><format-balance :balance="balance" /></div>
    </div>
    <div class="row">
      <div>{{ $t('address') }}</div>
      <div>{{ getShortenAddress(accountAddress) }}</div>
      <div class="tw-justify-self-end">
        <button type="button" class="icon tw-tooltip" @click="copyAddress">
          <icon-base
            class="tw-h-5 tw-w-5 dark:tw-text-darkGray-100"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <icon-document-duplicate />
          </icon-base>

          <!-- Tooltip -->
          <span
            class="
              tw-pointer-events-none
              tw-hidden
              tw-absolute
              tw-top-0
              tw-left-1/2
              tw-z-10
              tw-transform
              tw--translate-y-full
              tw--translate-x-1/2
              tw-p-1
              tw-text-xs
              tw-leading-tight
              tw-text-white
              tw-bg-gray-800
              dark:tw-bg-darkGray-500
              tw-rounded-md tw-shadow-lg tw-whitespace-nowrap
            "
            >{{ $t('copy') }}</span
          >
        </button>
      </div>
    </div>
    <div>
      <button
        class="transfer-button"
        :disabled="isDisableAction"
        :class="isDisableAction ? 'disabled_btn' : ''"
      >
        {{ $t(accountName === accountLabel.h160 ? 'balance.withdraw' : 'balance.transfer') }}
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect, computed, watch } from 'vue';
import { useStore } from 'src/store';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconLink from 'components/icons/IconLink.vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import IconDocumentDuplicate from 'components/icons/IconDocumentDuplicate.vue';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { AccountFormat } from './Accounts.vue';
import { toEvmAddress } from 'src/hooks/helper/plasmUtils';
import FormatBalance from 'components/balance/FormatBalance.vue';
import BN from 'bn.js';
import { useAccount } from 'src/hooks';
export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    IconLink,
    IconDocumentDuplicate,
    FormatBalance,
  },
  props: {
    format: {
      type: String,
      required: true,
    },
    balance: {
      type: BN,
      required: true,
    },
    isDisableAction: {
      type: Boolean,
      required: true,
    },
  },
  setup({ format, isDisableAction }) {
    const store = useStore();
    const accountAddress = ref<string>('');
    const accountName = ref<string>('');
    const accountLabel = {
      ss58: 'balance.accountSs58',
      h160: 'balance.accountH160',
      ethereum: 'balance.accountEthereum',
    };
    const { currentAccount } = useAccount();
    const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);

    watchEffect(() => {
      if (!currentAccount) return;

      accountAddress.value =
        format === AccountFormat.Ethereum
          ? currentEcdsaAccount.value.ethereum
          : format === AccountFormat.SS58
          ? currentAccount.value
          : toEvmAddress(currentAccount.value);

      accountName.value =
        format === AccountFormat.Ethereum
          ? accountLabel.ethereum
          : format === AccountFormat.SS58
          ? accountLabel.ss58
          : accountLabel.h160;
    });

    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${accountAddress.value}`
    );

    const isSubscan = providerEndpoints[currentNetworkIdx.value].subscan !== '';

    const copyAddress = async () => {
      await navigator.clipboard.writeText(accountAddress.value);
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy address success!!',
        alertType: 'success',
      });
    };

    return {
      accountAddress,
      subScan,
      isSubscan,
      currentNetworkIdx,
      copyAddress,
      getShortenAddress,
      accountName,
      accountLabel,
    };
  },
});
</script>

<style scoped>
.icon {
  @apply tw-p-2 tw-rounded-full tw-relative;
}
.icon:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-600;
}
.icon:focus {
  @apply tw-z-10 tw-outline-none tw-ring tw-ring-gray-100 tw-bg-blue-50 dark:tw-ring-darkGray-600 dark:tw-bg-darkGray-900;
}

.row {
  margin-top: 6px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}

.disabled_btn {
  background: #c6d3e1 !important;
}
.btn {
  text-align: center;
}

.transfer-button {
  @apply tw-mt-8 tw-flex tw-justify-center tw-px-4 tw-py-2 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-md tw-shadow-sm tw-text-white tw-bg-blue-500  xl:tw-w-auto;
}
.transfer-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
</style>
