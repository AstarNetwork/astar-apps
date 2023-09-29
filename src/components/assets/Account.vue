<template>
  <div class="wrapper--account">
    <div v-if="isLockdropAccount && !isH160" class="container--lockdrop-warning">
      <div>
        <span class="text--warning-bold">{{ $t('assets.inLockdropAccount') }}</span>
      </div>
      <ul class="row--warning-list">
        <li class="text--warning">
          {{ $t('assets.cantTransferToExcahges') }}
        </li>
        <li class="text--warning">{{ $t('assets.noHash') }}</li>
      </ul>
    </div>

    <div class="container">
      <div
        v-if="isLockdropAccount || (!isH160 && currentAccountName === ETHEREUM_EXTENSION)"
        class="row"
      >
        <span class="text--title">{{ $t('assets.lockdropAccount') }}</span>
        <span class="text--switch-account" @click="toggleEvmWalletSchema">
          {{ $t(isH160 ? 'assets.switchToNative' : 'assets.switchToEvm') }}
        </span>
      </div>

      <div class="row--details">
        <div class="column-account-name">
          <img
            v-if="iconWallet"
            width="24"
            :src="iconWallet"
            alt="wallet-icon"
            :class="multisig && 'img--polkasafe'"
          />
          <span class="text--accent">{{ currentAccount ? currentAccountName : 'My Wallet' }}</span>
        </div>
        <div class="column-address-icons">
          <div class="column__address">
            <span>{{ getShortenAddress(currentAccount) }}</span>
          </div>
          <div class="row__column--right">
            <div class="screen--sm" :class="isH160 ? 'column--usd' : 'column--usd-native'">
              <span class="text--accent">{{ $n(totalBal) }} USD</span>
            </div>
            <div class="column__icons">
              <div>
                <!-- TODO: open the account unification modal -->
                <button type="button" class="icon--primary icon--account">
                  <!-- TODO: will move a new icon to the AstarUI later -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="icon">
                    <path
                      d="M480-492.309q-57.749 0-98.874-41.124-41.125-41.125-41.125-98.874 0-57.75 41.125-98.874 41.125-41.125 98.874-41.125 57.749 0 98.874 41.125 41.125 41.124 41.125 98.874 0 57.749-41.125 98.874-41.125 41.124-98.874 41.124ZM180.001-187.694v-88.922q0-29.384 15.962-54.422 15.961-25.038 42.653-38.5 59.308-29.077 119.654-43.615T480-427.691q61.384 0 121.73 14.538 60.346 14.538 119.654 43.615 26.692 13.462 42.653 38.5 15.962 25.038 15.962 54.422v88.922H180.001ZM240-247.693h480v-28.923q0-12.154-7.039-22.5-7.038-10.346-19.115-16.885-51.692-25.461-105.418-38.577Q534.702-367.693 480-367.693t-108.428 13.115q-53.726 13.116-105.418 38.577-12.077 6.539-19.115 16.885Q240-288.77 240-276.616v28.923Zm240-304.614q33 0 56.5-23.5t23.5-56.5q0-33-23.5-56.5t-56.5-23.5q-33 0-56.5 23.5t-23.5 56.5q0 33 23.5 56.5t56.5 23.5Zm0-80Zm0 384.614Z"
                    />
                  </svg>
                </button>
                <q-tooltip>
                  <span class="text--tooltip">Unify accounts</span>
                </q-tooltip>
              </div>
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
      <div v-if="isH160">
        <evm-native-token />
      </div>
      <div v-if="multisig" class="row--details-signatory">
        <div class="column-account-name">
          <img v-if="iconWallet" width="24" :src="signatoryIconWallet" alt="wallet-icon" />
          <span class="text--accent">{{
            $t('assets.theSignatory', { account: multisig.signatory.name })
          }}</span>
        </div>
      </div>
      <div class="row screen--phone">
        <span>{{ $t('assets.totalBalance') }}</span>
        <q-skeleton v-if="isSkeleton" animation="fade" class="skeleton--md" />
        <span v-else class="text--total-balance"> ${{ $n(totalBal) }} </span>
      </div>
      <native-asset-list v-if="!isH160" />
    </div>
    <modal-lockdrop-warning
      v-if="isLockdropAccount && !isH160"
      :is-modal="isModalLockdropWarning"
      :handle-modal="handleModalLockdropWarning"
    />
  </div>
</template>
<script lang="ts">
import { isValidEvmAddress, getShortenAddress } from '@astar-network/astar-sdk-core';
import { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import copy from 'copy-to-clipboard';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import {
  useAccount,
  useBalance,
  useConnectWallet,
  useNetworkInfo,
  usePrice,
  useWalletIcon,
} from 'src/hooks';
import { useEvmAccount } from 'src/hooks/custom-signature/useEvmAccount';
import { getEvmMappedSs58Address, setAddressMapping } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import EvmNativeToken from 'src/components/assets/EvmNativeToken.vue';
import ModalLockdropWarning from 'src/components/assets/modals/ModalLockdropWarning.vue';
import { ETHEREUM_EXTENSION } from 'src/hooks';
import { supportWalletObj } from 'src/config/wallets';

export default defineComponent({
  components: {
    NativeAssetList,
    ModalLockdropWarning,
    EvmNativeToken,
  },
  props: {
    ttlErc20Amount: {
      type: Number,
      required: true,
    },
    ttlNativeXcmUsdAmount: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const balUsd = ref<number | null>(null);
    const isCheckingSignature = ref<boolean>(false);
    const isLockdropAccount = ref<boolean>(false);
    const isModalLockdropWarning = ref<boolean>(true);
    const { toggleEvmWalletSchema } = useConnectWallet();
    const { currentAccount, currentAccountName, multisig } = useAccount();
    const { balance, isLoadingBalance } = useBalance(currentAccount);
    const { nativeTokenUsd } = usePrice();
    const { requestSignature } = useEvmAccount();
    const { iconWallet } = useWalletIcon();

    const store = useStore();
    const { t } = useI18n();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isEthWallet = computed<boolean>(() => store.getters['general/isEthWallet']);

    const { currentNetworkIdx } = useNetworkInfo();
    const blockscout = computed<string>(
      () =>
        `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/${currentAccount.value}`
    );
    const subScan = computed<string>(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${currentAccount.value}`
    );

    const totalBal = computed<number>(
      () => Number(balUsd.value) + props.ttlErc20Amount + props.ttlNativeXcmUsdAmount
    );

    const signatoryIconWallet = computed<string>(() => {
      // @ts-ignore
      return multisig.value ? supportWalletObj[multisig.value.signatory.source].img : '';
    });

    const handleModalLockdropWarning = ({ isOpen }: { isOpen: boolean }) => {
      isModalLockdropWarning.value = isOpen;
    };

    const copyAddress = () => {
      copy(currentAccount.value);
      store.dispatch('general/showAlertMsg', {
        msg: t('toast.copyAddressSuccessfully'),
        alertType: 'copied',
      });
    };

    const isSkeleton = computed<boolean>(() => {
      if (!nativeTokenUsd.value) return false;
      return isLoadingBalance.value;
    });

    watch(
      [balance, nativeTokenUsd, currentAccount, isH160],
      () => {
        balUsd.value = null;
        const isEvmShiden = currentNetworkIdx.value === endpointKey.SHIDEN && isH160.value;
        if (!balance.value || !nativeTokenUsd.value) return;
        if (isEvmShiden) {
          // Memo: get the value from cbridge hooks
          balUsd.value = 0;
          return;
        }

        const bal = Number(ethers.utils.formatEther(balance.value.toString()));
        balUsd.value = nativeTokenUsd.value * bal;
      },
      { immediate: true }
    );

    watchEffect(async () => {
      try {
        if (!isH160.value || !isValidEvmAddress(currentAccount.value)) return;
        isCheckingSignature.value = true;
        await setAddressMapping({ evmAddress: currentAccount.value, requestSignature });
      } catch (error: any) {
        console.error(error.message);
      } finally {
        isCheckingSignature.value = false;
      }
    });

    watch(
      [isH160, isCheckingSignature, isEthWallet],
      async () => {
        const apiRef = $api;
        if (!isEthWallet.value) {
          isLockdropAccount.value = false;
          return;
        }
        if (
          !apiRef ||
          !currentAccount.value ||
          !isValidEvmAddress(currentAccount.value) ||
          isCheckingSignature.value
        ) {
          return;
        }
        try {
          const ss58 = getEvmMappedSs58Address(currentAccount.value);
          if (!ss58) return;
          const { data } = await apiRef.query.system.account<FrameSystemAccountInfo>(ss58);
          if (Number(data.free.toString()) > 0) {
            isLockdropAccount.value = true;
          } else {
            isLockdropAccount.value = false;
          }
        } catch (error: any) {
          console.error(error.message);
          isLockdropAccount.value = false;
        }
      },
      { immediate: false }
    );

    return {
      iconWallet,
      currentAccountName,
      currentAccount,
      blockscout,
      subScan,
      isDarkTheme,
      isH160,
      isEthWallet,
      balUsd,
      isLockdropAccount,
      isSkeleton,
      totalBal,
      ETHEREUM_EXTENSION,
      multisig,
      supportWalletObj,
      signatoryIconWallet,
      isModalLockdropWarning,
      handleModalLockdropWarning,
      getShortenAddress,
      copyAddress,
      toggleEvmWalletSchema,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/account.scss';
</style>
