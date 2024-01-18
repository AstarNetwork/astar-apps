<template>
  <div class="wrapper--account-detail">
    <div class="box--account">
      <div v-if="accountName" class="row--account">
        <div class="account-name">
          <span>
            {{ accountName }}
          </span>
        </div>
        <div v-if="!isUnifiedAccount" class="address">
          {{ getShortenAddress(accountAddress) }}
        </div>
      </div>
      <div v-if="isUnifiedAccount" class="row--account">
        <div class="address">
          {{ getShortenAddress(accountAddress) }}
        </div>
      </div>
      <div v-if="showBalance" class="row--balance-icons">
        <div>
          <span v-if="showBalanceValue" class="text--balance">
            {{ $n(getBalance(accountAddress)) }}
            {{ nativeTokenSymbol }}
          </span>
          <span v-else class="text--balance-hide"> ----- {{ nativeTokenSymbol }} </span>
        </div>
      </div>
    </div>
    <div class="icons">
      <button class="box--share btn--primary" @click="copyAddress(accountAddress)">
        <div class="icon--primary">
          <astar-icon-copy />
        </div>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('copy') }}</span>
        </q-tooltip>
      </button>
      <a :href="explorerUrl + accountAddress" target="_blank" rel="noopener noreferrer">
        <button class="box--share btn--primary">
          <div class="icon--primary">
            <astar-icon-external-link />
          </div>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.explorer') }}</span>
          </q-tooltip>
        </button>
      </a>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import copy from 'copy-to-clipboard';
import { useStore } from 'src/store';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    accountName: {
      type: String,
      required: false,
      default: '',
    },
    accountAddress: {
      type: String,
      required: true,
    },
    explorerUrl: {
      type: String,
      required: true,
    },
    showBalanceValue: {
      type: Boolean,
      required: true,
    },
    showBalance: {
      type: Boolean,
      required: false,
      default: true,
    },
    nativeTokenSymbol: {
      type: String,
      required: true,
    },
    getBalance: {
      type: Function,
      required: true,
    },
    isUnifiedAccount: {
      type: Boolean,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const { t } = useI18n();

    const copyAddress = (address: string): void => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    return { getShortenAddress, copyAddress };
  },
});
</script>
<style lang="scss" scoped>
@use 'src/components/header/styles/select-account.scss';
</style>
