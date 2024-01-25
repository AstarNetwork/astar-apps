<template>
  <div
    class="wrapper--modal-account animate__animated animate__fadeInRight"
    :class="isClosing && 'animate__animated animate__fadeOutLeft'"
  >
    <div class="row--back">
      <button class="button--back" @click="backModal()">
        <astar-icon-back-with-color />
      </button>
      <div class="row--balance-option">
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
    </div>
    <div>
      <div class="row--separator--account">
        <div class="border--separator--account" />
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
        <ul v-else role="radiogroup" class="list--account" :style="`max-height: ${windowHeight}px`">
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
              <account
                v-if="!account.evmAddress"
                :account-name="account.name"
                :account-address="account.address"
                :explorer-url="subScan"
                :native-token-symbol="nativeTokenSymbol"
                :show-balance-value="isShowBalance && !isLoadingBalance"
                :get-balance="displayBalance"
                :is-unified-account="false"
              />
              <unified-account
                v-else
                :native-address="account.address"
                :evm-address="account.evmAddress ?? ''"
                :account-name="account.name"
                :show-balance="isShowBalance && !isLoadingBalance"
                :native-token-symbol="nativeTokenSymbol"
                :explorer-url="subScan"
                :avatar-url="account.avatarUrl ?? ''"
                :get-balance="displayBalance"
              />
              <div v-if="index === previousSelIdx" class="dot" />
            </label>
          </li>
        </ul>
      </fieldset>
    </div>
    <div class="wrapper__row--button">
      <div v-if="currentNetworkChain === astarChain.ASTAR" class="row--ledger-check">
        <span class="text--is-ledger">
          {{ $t('wallet.isLedgerAccount') }}
        </span>
        <div class="toggle--custom">
          <q-toggle v-model="toggleIsLedger" color="#0085ff" />
        </div>
      </div>
      <astar-button
        :disabled="(substrateAccounts.length > 0 && !selAccount) || (isLedger && !isLedgerReady)"
        class="btn--connect"
        @click="selectAccount(selAccount)"
      >
        {{ $t('connect') }}
      </astar-button>
    </div>
  </div>
</template>
<script lang="ts">
import {
  fetchNativeBalance,
  getShortenAddress,
  truncate,
  wait,
} from '@astar-network/astar-sdk-core';
import { ApiPromise } from '@polkadot/api';
import { Ledger } from '@polkadot/hw-ledger';
import copy from 'copy-to-clipboard';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { astarChain } from 'src/config/chain';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SupportWallet } from 'src/config/wallets';
import { useAccount, useBreakpoints, useNetworkInfo } from 'src/hooks';
import { castMobileSource, checkIsEthereumWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { PropType, computed, defineComponent, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Account from './Account.vue';
import UnifiedAccount from './UnifiedAccount.vue';

export default defineComponent({
  components: {
    UnifiedAccount,
    Account,
  },
  props: {
    selectedWallet: {
      type: String as PropType<SupportWallet>,
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
    setModalAccountSelect: {
      type: Function,
      required: true,
    },
    selectNetwork: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const isShowBalance = ref<boolean>(false);
    const isLoadingBalance = ref<boolean>(false);
    const toggleIsLedger = ref<boolean>(false);
    const isLedgerReady = ref<boolean>(false);
    const accountBalanceMap = ref<SubstrateAccount[]>([]);

    const isClosing = ref<boolean>(false);
    const closeUi = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
    };

    const backModal = async (): Promise<void> => {
      await closeUi();
      props.setModalAccountSelect(false);
    };

    const store = useStore();
    const { t } = useI18n();
    const { width, screenSize } = useBreakpoints();
    const { currentNetworkChain } = useNetworkInfo();
    const { checkIfUnified } = useAccount();

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

    const isLedger = computed<boolean>(() => store.getters['general/isLedger']);

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
      if (substrateAccount) {
        store.commit('general/setCurrentAddress', substrateAccount);
        const wallet = substrateAccounts.value.find((it) => it.address === substrateAccount);
        wallet && localStorage.setItem(LOCAL_STORAGE.SELECTED_WALLET, wallet.source);
      }
      store.commit('general/setCurrentWallet', props.selectedWallet);
      localStorage.removeItem(LOCAL_STORAGE.MULTISIG);
      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.SELECTED_WALLET));
      await props.selectNetwork();
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
      const adjustment = width.value > screenSize.sm ? 450 : 390;
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
          const [balance, unifiedAccount] = await Promise.all([
            fetchNativeBalance({
              api: $api as ApiPromise,
              address: it.address,
            }),
            checkIfUnified(it.address, false),
          ]);

          return {
            ...it,
            balance,
            evmAddress: unifiedAccount?.evmAddress,
            name: unifiedAccount?.name ?? it.name,
            avatarUrl: unifiedAccount?.avatarUrl,
          };
        })
      );
      // Memo: we use local `accountBalanceMap` state because updating global `substrateAccounts` state triggers UI bug on this drawer
      accountBalanceMap.value = updatedAccountMap;
    };

    watch(
      [isShowBalance, substrateAccountsAll],
      async () => {
        if (!substrateAccountsAll.value.length) return;
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

    const updateIsLedgerAccount = async (isLedger: boolean): Promise<void> => {
      localStorage.setItem(LOCAL_STORAGE.IS_LEDGER, isLedger.toString());
      store.commit('general/setIsLedger', isLedger);
      if (isLedger) {
        try {
          // Memo: send a popup request for permission(first time only)
          const ledgerData = new Ledger('hid', 'astar');
          if (process.env.DEV) {
            console.info('ledgerData', ledgerData);
          }

          const { address } = await ledgerData.getAddress();
          if (address) {
            isLedgerReady.value = true;
            const transport = (ledgerData as any).__internal__app.transport;
            transport.close();
          }
        } catch (error: any) {
          console.error(error);
          const idLedgerLocked = '0x5515';
          const idNotRunningApp = '28161';
          let errMsg = '';

          if (error.message.includes(idLedgerLocked)) {
            errMsg = error.message;
          } else if (error.message.includes(idNotRunningApp)) {
            errMsg = t('warning.ledgerNotOpened');
          }

          if (errMsg) {
            store.dispatch('general/showAlertMsg', {
              msg: errMsg,
              alertType: 'error',
            });
          }
        }
      } else {
        isLedgerReady.value = false;
      }
    };

    watch([selAccount], () => {
      toggleIsLedger.value = false;
    });

    watch(
      [isLedger],
      () => {
        toggleIsLedger.value = isLedger.value;
      },
      {
        immediate: true,
      }
    );

    watch([toggleIsLedger], async () => {
      await updateIsLedgerAccount(toggleIsLedger.value);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', onHeightChange);
    });

    return {
      selAccount,
      selectAccount,
      previousSelIdx,
      currentNetworkStatus,
      substrateAccounts,
      SupportWallet,
      currentNetworkIdx,
      subScan,
      nativeTokenSymbol,
      isLoadingBalance,
      accountBalanceMap,
      copyAddress,
      getShortenAddress,
      endpointKey,
      isMathWallet,
      windowHeight,
      toggleIsLedger,
      isShowBalance,
      currentNetworkChain,
      astarChain,
      isLedgerReady,
      isLedger,
      displayBalance,
      backModal,
      isClosing,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/select-account.scss';

.animate__animated.animate__fadeInRight {
  --animate-delay: 1s;
  --animate-duration: 0.8s;
}
.animate__animated.animate__fadeOutLeft {
  --animate-duration: 0.8s;
}
</style>
