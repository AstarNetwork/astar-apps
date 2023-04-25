<template>
  <astar-modal-drawer
    :show="isOpen && !isSelected"
    title="Wallet"
    :is-closing="isClosing"
    :is-back="true"
    :handle-back="backModal"
    @close="closeModal"
  >
    <div class="wrapper--modal-account">
      <div class="wrapper--select-network">
        <div class="row--separator--account">
          <div class="border--separator--account" />
        </div>
        <div>
          <selected-wallet :selected-wallet="selectedWallet" />
        </div>
        <div v-if="isNativeWallet" class="row--balance-option">
          <div class="column--balance-option">
            <span class="text--option-label">
              {{ $t('wallet.showBalance', { token: nativeTokenSymbol }) }}
            </span>
            <!-- Memo: `toggle--custom`: defined in app.scss due to unable to define in this file -->
            <div class="toggle--custom">
              <q-toggle v-model="isShowBalance" color="#0085ff" />
            </div>
          </div>
        </div>
        <fieldset>
          <div v-if="isMathWallet" class="column--remarks">
            <li v-if="currentNetworkIdx !== endpointKey.SHIDEN">
              {{ $t('wallet.math.supportsNetwork') }}
            </li>
            <li v-if="!substrateAccounts.length">
              {{ $t('wallet.math.switchNetwork') }}
            </li>
          </div>
          <ul
            v-else
            role="radiogroup"
            class="list--account"
            :style="`max-height: ${windowHeight}px`"
          >
            <li v-for="(account, index) in substrateAccounts" :key="index">
              <label
                :class="[
                  'class-radio',
                  selAccount === account.address ? 'class-radio-on' : 'class-radio-off',
                ]"
              >
                <astar-radio-btn
                  :checked="selAccount === account.address"
                  class="radio-btn"
                  @change="selAccount = account.address"
                />
                <div class="wrapper--account-detail">
                  <div class="box--account">
                    <div class="row--account">
                      <div class="account-name">
                        <span>
                          {{ account.name }}
                        </span>
                      </div>
                      <div class="address">
                        <span>
                          {{ getShortenAddress(account.address, 4) }}
                        </span>
                      </div>
                    </div>
                    <div class="row--balance-icons">
                      <div>
                        <span v-if="isShowBalance && !isLoadingBalance" class="text--balance">
                          {{ $n(displayBalance(account.address)) }}
                          {{ nativeTokenSymbol }}
                        </span>
                        <span v-else class="text--balance-hide">
                          ----- {{ nativeTokenSymbol }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="icons">
                    <button class="box--share btn--primary" @click="copyAddress(account.address)">
                      <div class="icon--primary">
                        <astar-icon-copy />
                      </div>
                      <q-tooltip>
                        <span class="text--tooltip">{{ $t('copy') }}</span>
                      </q-tooltip>
                    </button>
                    <a :href="subScan + account.address" target="_blank" rel="noopener noreferrer">
                      <button class="box--share btn--primary">
                        <div class="icon--primary">
                          <astar-icon-external-link />
                        </div>
                        <q-tooltip>
                          <span class="text--tooltip">{{ $t('subscan') }}</span>
                        </q-tooltip>
                      </button>
                    </a>
                  </div>
                </div>
                <div v-if="index === previousSelIdx" class="dot" />
              </label>
            </li>
          </ul>
        </fieldset>
      </div>
      <div class="wrapper__row--button">
        <astar-button
          :disabled="(substrateAccounts.length > 0 && !selAccount) || !isNativeWallet"
          class="btn--connect"
          @click="selectAccount(selAccount)"
        >
          {{ $t('connect') }}
        </astar-button>
        <button :disabled="!currentAccountName" class="btn--disconnect" @click="disconnect()">
          {{ $t('disconnect') }}
        </button>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import { ApiPromise } from '@polkadot/api';
import copy from 'copy-to-clipboard';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import SelectedWallet from 'src/components/header/modals/SelectedWallet.vue';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SupportWallet } from 'src/config/wallets';
import {
  getShortenAddress,
  truncate,
  wait,
  fetchNativeBalance,
} from '@astar-network/astar-sdk-core';
import {
  castMobileSource,
  checkIsEthereumWallet,
  checkIsNativeWallet,
} from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, PropType, ref, watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useExtensions } from 'src/hooks/useExtensions';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { useAccount, useBreakpoints } from 'src/hooks';

export default defineComponent({
  components: {
    SelectedWallet,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    selectedWallet: {
      type: String as PropType<SupportWallet>,
      required: true,
    },
    openSelectModal: {
      type: Function,
      required: true,
    },
    connectEthereumWallet: {
      type: Function,
      required: true,
    },
    disconnectAccount: {
      type: Function,
      required: true,
    },
    currentAccount: {
      type: String,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const isSelected = ref<boolean>(false);
    const isClosing = ref<boolean>(false);
    const isShowBalance = ref<boolean>(false);
    const isLoadingBalance = ref<boolean>(false);
    const accountBalanceMap = ref<SubstrateAccount[]>([]);
    const { currentAccountName, disconnectAccount } = useAccount();

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      emit('update:is-open', false);
    };

    const disconnect = async () => {
      await disconnectAccount();
      await backModal();
    };

    const backModal = async (): Promise<void> => {
      await closeModal();
      props.openSelectModal();
    };

    const store = useStore();
    const { t } = useI18n();
    const { width, screenSize } = useBreakpoints();

    const isNativeWallet = computed<boolean>(() => checkIsNativeWallet(props.selectedWallet));

    const substrateAccounts = computed<SubstrateAccount[]>(() => {
      const accounts: SubstrateAccount[] = accountBalanceMap.value || [];
      const filteredAccounts = accounts.filter((it) => {
        const lookupWallet = castMobileSource(props.selectedWallet);
        return it.source === lookupWallet;
      });

      return filteredAccounts.sort((a, b) => Number(b.balance) - Number(a.balance));
    });

    const substrateAccountsAll = computed<SubstrateAccount[]>(
      () => store.getters['general/substrateAccounts']
    );

    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    const nativeTokenSymbol = computed<string>(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const currentNetworkIdx = computed<number>(() => store.getters['general/networkIdx']);
    const isMathWallet = computed<boolean>(
      () => !substrateAccounts.value.length && props.selectedWallet === SupportWallet.Math
    );

    const selectAccount = async (substrateAccount: string): Promise<void> => {
      await props.disconnectAccount();
      if (checkIsEthereumWallet(props.selectedWallet)) {
        props.connectEthereumWallet(props.selectedWallet);
      }
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      if (substrateAccount) {
        store.commit('general/setCurrentAddress', substrateAccount);
        const wallet = substrateAccounts.value.find((it) => it.address === substrateAccount);
        wallet && localStorage.setItem(LOCAL_STORAGE.SELECTED_WALLET, wallet.source);
      }
      isSelected.value = true;
      isClosing.value = false;
      emit('update:is-open', false);
      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.SELECTED_WALLET));
    };

    const selAccount = ref<string>('');
    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/`
    );

    const previousSelIdx = computed<number | null>(() => {
      if (substrateAccounts.value && props.currentAccount) {
        const index = substrateAccounts.value.findIndex(
          (it: SubstrateAccount) => it.address === props.currentAccount
        );
        return index;
      } else {
        return null;
      }
    });

    const copyAddress = (address: string): void => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    const windowHeight = ref<number>(window.innerHeight);
    const onHeightChange = () => {
      const adjustment = width.value > screenSize.sm ? 546 : 390;
      windowHeight.value = window.innerHeight - adjustment;
    };

    window.addEventListener('resize', onHeightChange);
    onHeightChange();

    const displayBalance = (address: string): number => {
      if (!accountBalanceMap.value) return 0;
      const account = accountBalanceMap.value.find((it) => it.address === address);
      const balance = account ? account.balance : '0';
      return truncate(ethers.utils.formatEther(balance || '0'));
    };

    const updateAccountMap = async (): Promise<void> => {
      isLoadingBalance.value = true;
      const updatedAccountMap = await Promise.all(
        substrateAccountsAll.value.map(async (it) => {
          const balance = await fetchNativeBalance({
            api: $api as ApiPromise,
            address: it.address,
          });
          return { ...it, balance };
        })
      );
      // Memo: we use local `accountBalanceMap` state because updating global `substrateAccounts` state triggers UI bug on this drawer
      accountBalanceMap.value = updatedAccountMap;
    };

    watch(
      [isLoading, isShowBalance, substrateAccountsAll],
      async () => {
        if (!substrateAccountsAll.value.length || isLoading.value) return;
        try {
          await updateAccountMap();
        } catch (error) {
          console.error(error);
        } finally {
          isLoadingBalance.value = false;
        }
      },
      { immediate: true }
    );

    const requestExtensionsIfFirstAccess = (): void => {
      if (!isNativeWallet.value) return;
      // Memo: displays wallet's authorization popup
      const { extensions } = useExtensions($api!!, store);
      const { metaExtensions, extensionCount } = useMetaExtensions($api!!, extensions)!!;
      store.commit('general/setMetaExtensions', metaExtensions.value);
      store.commit('general/setExtensionCount', extensionCount.value);
    };

    watch([isNativeWallet, props.selectedWallet], requestExtensionsIfFirstAccess, {
      immediate: false,
    });

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

    return {
      selAccount,
      closeModal,
      selectAccount,
      previousSelIdx,
      currentNetworkStatus,
      substrateAccounts,
      SupportWallet,
      currentNetworkIdx,
      subScan,
      isNativeWallet,
      nativeTokenSymbol,
      isLoadingBalance,
      accountBalanceMap,
      copyAddress,
      getShortenAddress,
      endpointKey,
      isMathWallet,
      windowHeight,
      isSelected,
      isClosing,
      isShowBalance,
      currentAccountName,
      displayBalance,
      backModal,
      disconnect,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
</style>
