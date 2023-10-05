<template>
  <div>
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

    <div class="wrapper--account">
      <div class="row--account-info">
        <div class="column--account-icon">
          <!-- TODO: unified account icon -->
          <img
            v-if="iconWallet"
            width="24"
            :src="iconWallet"
            alt="wallet-icon"
            :class="multisig && 'img--polkasafe'"
          />
        </div>

        <div>
          <!-- TODO: unified account icon -->
          <div class="text--title">
            <span v-if="isUnifiedAccount">Unified Account Name</span>
            <span v-else>{{ currentAccount ? currentAccountName : $t('assets.myWallet') }}</span>
          </div>
          <div class="text--balance">
            {{ $n(totalBal) }}
            <span>USD</span>
          </div>
        </div>
      </div>

      <div class="row--actions">
        <div>
          <!-- TODO: add logic -->
          <button class="btn--icon">
            <!-- TODO: use AstarUI icon -->
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.56 16.73C21.2 16.17 20.72 15.73 20.12 15.43C18.81 14.79 17.46 14.3 16.12 13.97C13.45 13.33 10.66 13.33 7.98 13.97C6.64 14.29 5.3 14.78 3.98 15.43C3.38 15.73 2.9 16.17 2.54 16.73C2.18 17.29 2 17.91 2 18.57V21.53C2 21.53 2.02 21.58 2.05 21.58H22.05C22.05 21.58 22.1 21.56 22.1 21.53V18.57C22.1 17.91 21.92 17.29 21.56 16.73ZM4.1 19.49V18.58C4.1 18.32 4.18 18.08 4.33 17.86C4.48 17.64 4.69 17.45 4.95 17.31C6.09 16.75 7.27 16.32 8.45 16.03C10.82 15.45 13.28 15.45 15.66 16.03C16.84 16.32 18.02 16.75 19.16 17.31C19.42 17.45 19.63 17.64 19.78 17.86C19.93 18.08 20.01 18.32 20.01 18.58V19.49H4.1Z"
                fill="currentColor"
              />
              <path
                d="M12.05 11.43C13.34 11.43 14.46 10.96 15.38 10.04C16.3 9.11999 16.77 7.99999 16.77 6.70999C16.77 5.41999 16.3 4.29999 15.38 3.37999C14.46 2.45999 13.34 1.98999 12.05 1.98999C10.76 1.98999 9.63999 2.45999 8.71999 3.37999C7.79999 4.29999 7.32999 5.41999 7.32999 6.70999C7.32999 7.99999 7.79999 9.11999 8.71999 10.04C9.63999 10.96 10.76 11.43 12.05 11.43ZM10.2 4.86999C10.71 4.35999 11.33 4.09999 12.05 4.09999C12.77 4.09999 13.39 4.35999 13.9 4.86999C14.41 5.37999 14.67 5.99999 14.67 6.71999C14.67 7.43999 14.41 8.05999 13.9 8.56999C13.39 9.07999 12.77 9.33999 12.05 9.33999C11.33 9.33999 10.71 9.07999 10.2 8.56999C9.68999 8.05999 9.42999 7.43999 9.42999 6.71999C9.42999 5.99999 9.68999 5.37999 10.2 4.86999Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <q-tooltip>
            <span class="text--tooltip">Unify accounts</span>
          </q-tooltip>
        </div>

        <div>
          <button id="copyAddress" type="button" class="btn--icon" @click="copyAddress">
            <astar-icon-copy class="icon--copy" />
          </button>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('copy') }}</span>
          </q-tooltip>
        </div>

        <a :href="isH160 ? blockscout : subScan" target="_blank" rel="noopener noreferrer">
          <button class="btn--icon">
            <astar-icon-external-link class="icon--external-link" />
          </button>
          <q-tooltip>
            <span class="text--tooltip">{{ $t(isH160 ? 'blockscout' : 'subscan') }}</span>
          </q-tooltip>
        </a>
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

    <native-asset-list v-if="!isH160" />

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
import { useAccount, useBalance, useNetworkInfo, usePrice, useWalletIcon } from 'src/hooks';
import { useEvmAccount } from 'src/hooks/custom-signature/useEvmAccount';
import { getEvmMappedSs58Address, setAddressMapping } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import ModalLockdropWarning from 'src/components/assets/modals/ModalLockdropWarning.vue';
import { ETHEREUM_EXTENSION } from 'src/hooks';
import { supportWalletObj } from 'src/config/wallets';

export default defineComponent({
  components: {
    ModalLockdropWarning,
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
    const isUnifiedAccount = ref<boolean>(false);
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
      isUnifiedAccount,
      handleModalLockdropWarning,
      getShortenAddress,
      copyAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/account.scss';
</style>
