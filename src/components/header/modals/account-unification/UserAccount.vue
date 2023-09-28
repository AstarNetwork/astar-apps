<template>
  <div>
    <!-- unified -->
    <div v-if="isAccountUnified">
      <div class="text--account-name">
        <img :src="icon_img.astar_gradient" class="text--account-name__icon" />
        <div>Unified Account Name</div>
      </div>
      <div class="box--wallet-list">
        <div class="row--wallet">native wallet</div>
        <div class="row--wallet">evm wallet</div>
      </div>
      <div class="btn--edit">
        <astar-button class="btn">Edit</astar-button>
      </div>
    </div>

    <!-- not unified -->
    <div v-else>
      <div class="text--account-name">
        {{ isH160 ? 'Astar EVM' : 'Astar Native' }}
      </div>

      <div class="box--wallet-list">
        <div class="row--wallet">
          <div class="column--icon">
            <img v-if="iconWallet" :src="iconWallet" alt="wallet icon" />
          </div>
          <div class="column--address">
            <div class="text--accent">
              {{ currentAccount ? currentAccountName : 'My Wallet' }}
            </div>
            <div>{{ getShortenAddress(currentAccount) }}</div>
          </div>
          <div class="column--actions">
            <div>
              <button id="copyAddress" type="button" class="icon--primary" @click="copyAddress">
                <astar-icon-copy />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('copy') }}</span>
              </q-tooltip>
            </div>
            <a :href="isH160 ? blockscout : subScan" target="_blank" rel="noopener noreferrer">
              <button class="icon--primary">
                <astar-icon-external-link />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t(isH160 ? 'blockscout' : 'subscan') }}</span>
              </q-tooltip>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Introduce Account Unification -->
    <div v-if="!isAccountUnified" class="wrapper--introduce-au">
      <div class="text--introduce-au">
        <span>Introducing new technology, unified account</span>
      </div>
      <astar-button class="btn" :disabled="currentAccount === ''" @click="next()">
        Create an Unified Account
      </astar-button>
    </div>

    <!-- Help -->
    <help />
  </div>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import { useAccount, useWalletIcon, useNetworkInfo } from 'src/hooks';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import copy from 'copy-to-clipboard';
import { useI18n } from 'vue-i18n';
import { providerEndpoints } from 'src/config/chainEndpoints';
import Help from 'src/components/header/modals/account-unification/Help.vue';

export default defineComponent({
  components: { Help },
  emits: ['next'],
  setup(props, { emit }) {
    const next = () => {
      emit('next');
    };

    const store = useStore();
    const { iconWallet } = useWalletIcon();
    const { currentAccount, currentAccountName } = useAccount();
    const { t } = useI18n();
    const { currentNetworkIdx } = useNetworkInfo();

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

    const copyAddress = (): void => {
      copy(currentAccount.value);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    const blockscout = computed<string>(
      () =>
        `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/${currentAccount.value}`
    );

    const subScan = computed<string>(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${currentAccount.value}`
    );

    const isAccountUnified = ref<boolean>(false);

    const icon_img = {
      astar_gradient: require('/src/assets/img/astar_icon.svg'),
    };

    return {
      isH160,
      iconWallet,
      currentAccount,
      currentAccountName,
      blockscout,
      subScan,
      isAccountUnified,
      icon_img,
      getShortenAddress,
      copyAddress,
      next,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
