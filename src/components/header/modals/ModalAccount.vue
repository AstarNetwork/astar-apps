<template>
  <astar-modal-drawer
    :show="isOpen && !isSelected"
    title="Wallet"
    :is-closing="isClosing"
    @close="closeModal"
  >
    <div class="wrapper--modal-account">
      <div class="wrapper--select-network">
        <div class="row--separator--account">
          <div class="border--separator--account" />
        </div>
        <div>
          <SelectWallet :set-wallet-modal="setWalletModal" :selected-wallet="selectedWallet" />
        </div>
        <div v-if="isNativeWallet" class="row--balance-option">
          <div class="column--balance-option">
            <span class="text--option-label">
              {{ $t('wallet.showBalance', { token: nativeTokenSymbol }) }}
            </span>
            <q-toggle v-model="isShowBalance" color="light-blue" />
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
                  @change="selAccount = account.address"
                />
                <div class="wrapper--account-detail">
                  <div class="accountName">{{ account.name }}</div>
                  <div class="row--address-icons">
                    <div class="address">{{ getShortenAddress(account.address) }}</div>
                    <div class="icons">
                      <button class="box--share btn--primary" @click="copyAddress(account.address)">
                        <div class="icon--primary" @click="copyAddress">
                          <astar-icon-copy />
                        </div>
                        <q-tooltip>
                          <span class="text--tooltip">{{ $t('copy') }}</span>
                        </q-tooltip>
                      </button>
                      <a
                        :href="subScan + account.address"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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
                  <div>
                    <span v-if="isShowBalance && !isLoadingBalance" class="text--balance">
                      {{ $n(displayBalance(account.address)) }}
                      {{ nativeTokenSymbol }}
                    </span>
                    <span v-else class="text--balance-hide"> ----- {{ nativeTokenSymbol }} </span>
                  </div>
                </div>
                <div v-if="index === previousSelIdx" class="dot"></div>
              </label>
            </li>
          </ul>
        </fieldset>
      </div>
      <div class="wrapper__row--button">
        <button
          :disabled="substrateAccounts.length > 0 && !selAccount"
          class="btn btn--connect"
          @click="selectAccount(selAccount)"
        >
          {{ $t('connect') }}
        </button>
      </div>
    </div>
  </astar-modal-drawer>
</template>
<script lang="ts">
import copy from 'copy-to-clipboard';
import { ethers } from 'ethers';
import SelectWallet from 'src/components/header/modals/SelectWallet.vue';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { SupportWallet } from 'src/config/wallets';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { wait } from 'src/hooks/helper/common';
import { castMobileSource, checkIsEthereumWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { checkIsNativeWallet } from 'src/hooks/helper/wallet';
import { truncate } from 'src/hooks/helper/common';
import { fetchNativeBalance } from 'src/modules/account';
import { ApiPromise } from '@polkadot/api';
import { $api } from 'src/boot/api';

export default defineComponent({
  components: {
    SelectWallet,
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
    setWalletModal: {
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

    const closeModal = async (): Promise<void> => {
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      isClosing.value = false;
      emit('update:is-open', false);
    };

    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const store = useStore();
    const { t } = useI18n();

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

    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const isMathWallet = computed(
      () => !substrateAccounts.value.length && props.selectedWallet === SupportWallet.Math
    );

    const selectAccount = async (substrateAccount: string) => {
      await props.disconnectAccount();
      if (checkIsEthereumWallet(props.selectedWallet)) {
        props.connectEthereumWallet(props.selectedWallet);
      }
      isClosing.value = true;
      const animationDuration = 500;
      await wait(animationDuration);
      substrateAccount && store.commit('general/setCurrentAddress', substrateAccount);
      isSelected.value = true;
      isClosing.value = false;
      emit('update:is-open', false);
    };

    const selAccount = ref<string>('');
    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/`
    );

    const previousSelIdx = computed(() => {
      if (substrateAccounts.value && props.currentAccount) {
        const index = substrateAccounts.value.findIndex(
          (it: SubstrateAccount) => it.address === props.currentAccount
        );
        return index;
      } else {
        return null;
      }
    });

    const copyAddress = (address: string) => {
      copy(address);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'success',
      });
    };

    const windowHeight = ref<number>(window.innerHeight);
    const onHeightChange = () => {
      windowHeight.value = window.innerHeight - 432;
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
      [isLoading, isShowBalance],
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

    return {
      selAccount,
      closeModal,
      selectAccount,
      previousSelIdx,
      currentNetworkStatus,
      substrateAccounts,
      SupportWallet,
      currentNetworkIdx,
      isDarkTheme,
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
      displayBalance,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account.scss';
</style>
