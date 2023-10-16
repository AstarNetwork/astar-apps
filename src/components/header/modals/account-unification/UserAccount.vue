<template>
  <div>
    <!-- unified -->
    <div v-if="isAccountUnified">
      <div class="text--account-name">
        <au-icon
          :native-address="unifiedAccount?.nativeAddress"
          :icon-url="unifiedAccount?.avatarUrl"
        />
        <div>{{ unifiedAccount?.name }}</div>
      </div>
      <div class="box--wallet-list">
        <div class="row--wallet">
          <div class="column--icon">
            <img :src="walletIcons.substrate" alt="wallet icon" />
          </div>
          <div class="column--address">
            <div>{{ getShortenAddress(unifiedAccount?.nativeAddress ?? '') }}</div>
          </div>
          <div class="column--actions">
            <div>
              <button
                id="copyAddress"
                type="button"
                class="icon--primary"
                @click="copyAddress(unifiedAccount?.nativeAddress ?? '')"
              >
                <astar-icon-copy />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('copy') }}</span>
              </q-tooltip>
            </div>
            <a :href="subScan" target="_blank" rel="noopener noreferrer">
              <button class="icon--primary">
                <astar-icon-external-link />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('subscan') }}</span>
              </q-tooltip>
            </a>
          </div>
        </div>
        <div class="row--wallet">
          <div class="column--icon">
            <img :src="walletIcons.evm" alt="wallet icon" />
          </div>
          <div class="column--address">
            <div>{{ getShortenAddress(unifiedAccount?.evmAddress ?? '') }}</div>
          </div>
          <div class="column--actions">
            <div>
              <button
                id="copyAddress"
                type="button"
                class="icon--primary"
                @click="copyAddress(unifiedAccount?.evmAddress ?? '')"
              >
                <astar-icon-copy />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('copy') }}</span>
              </q-tooltip>
            </div>
            <a :href="blockscout" target="_blank" rel="noopener noreferrer">
              <button class="icon--primary">
                <astar-icon-external-link />
              </button>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('blockscout') }}</span>
              </q-tooltip>
            </a>
          </div>
        </div>
      </div>
      <div class="btn--edit">
        <astar-button :disabled="isH160" class="btn" @click="edit()">{{
          $t('dappStaking.edit')
        }}</astar-button>
      </div>
    </div>

    <!-- not unified -->
    <div v-else>
      <div class="text--account-name">
        {{ $t(isH160 ? 'wallet.unifiedAccount.astarEvm' : 'wallet.unifiedAccount.astarNative') }}
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
              <button
                id="copyAddress"
                type="button"
                class="icon--primary"
                @click="copyAddress(currentAccount)"
              >
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

    <div v-if="!isAccountUnified" class="wrapper--introduce-au">
      <div class="text--introduce-au">
        <span>{{ $t('wallet.unifiedAccount.introduce') }}</span>
      </div>
      <astar-button class="btn" :disabled="currentAccount === ''" @click="next()">
        {{ $t('wallet.unifiedAccount.create') }}
      </astar-button>
    </div>

    <!-- Help -->
    <help />
  </div>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import { useAccount, useWalletIcon, useNetworkInfo, useAccountUnification } from 'src/hooks';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import copy from 'copy-to-clipboard';
import { useI18n } from 'vue-i18n';
import { providerEndpoints } from 'src/config/chainEndpoints';
import Help from 'src/components/header/modals/account-unification/Help.vue';
import AuIcon from './AuIcon.vue';

export default defineComponent({
  components: { Help, AuIcon },
  props: {
    setAccountName: {
      type: Function,
      required: true,
    },
  },
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
    const { unifiedAccount, isAccountUnified } = useAccountUnification();

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const walletIcons = {
      substrate: require('/src/assets/img/logo-polkadot-js.png'),
      evm: require('/src/assets/img/ethereum.png'),
    };

    const copyAddress = (address: string): void => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    const edit = (): void => {
      props.setAccountName(unifiedAccount.value?.name ?? '');
      next();
    };

    const blockscout = computed<string>(
      () =>
        `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/${
          unifiedAccount.value ? unifiedAccount.value.evmAddress : currentAccount.value
        }`
    );

    const subScan = computed<string>(
      () =>
        `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${
          unifiedAccount.value ? unifiedAccount.value.nativeAddress : currentAccount.value
        }`
    );

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
      unifiedAccount,
      walletIcons,
      getShortenAddress,
      copyAddress,
      next,
      edit,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
