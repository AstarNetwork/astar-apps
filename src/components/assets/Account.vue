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
      <div class="account-info">
        <div class="account-icon">
          <!-- TODO: need to add icon for unified account -->
          <div v-if="isH160">
            <img :src="account_icon.evm" />
          </div>
          <div v-else>
            <img :src="account_icon.native" />
          </div>
        </div>

        <div class="account-name-balance">
          <!-- TODO: need to replace to the dynamic account name -->
          <div class="account-name">Unified Account Name</div>

          <div class="account-balance">
            {{ $n(totalBal) }}
            <span>USD</span>
          </div>
        </div>
      </div>

      <div class="account-icon-buttons">
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
        <div>
          <button class="icon--primary" @click="console.log('TODO: open wallet select modal')">
            <astar-icon-3dots />
          </button>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.accountDetails') }}</span>
          </q-tooltip>
        </div>
      </div>
    </div>

    <div
      v-if="isLockdropAccount || (!isH160 && currentAccountName === ETHEREUM_EXTENSION)"
      class="row"
    >
      <span class="text--title">{{ $t('assets.lockdropAccount') }}</span>
      <span class="text--switch-account" @click="toggleEvmWalletSchema">
        {{ $t(isH160 ? 'assets.switchToNative' : 'assets.switchToEvm') }}
      </span>
    </div>

    <!-- <div class="column-account-name">
        <img
          v-if="iconWallet"
          width="24"
          :src="iconWallet"
          alt="wallet-icon"
          :class="multisig && 'img--polkasafe'"
        />
        <span class="text--accent">{{ currentAccount ? currentAccountName : 'My Wallet' }}</span>
      </div> -->
    <!-- <div class="column-address-icons">
      <div class="column__address">
          <span>{{ getShortenAddress(currentAccount) }}</span>
        </div>
    </div> -->

    <div v-if="multisig" class="row--details-signatory tw-mb-6 sm:tw-mb-0 sm:tw-mt-6 tw-rounded-lg">
      <div class="column-account-name">
        <img v-if="iconWallet" width="24" :src="signatoryIconWallet" alt="wallet-icon" />
        <span class="text--accent">
          {{ $t('assets.theSignatory', { account: multisig.signatory.name }) }}
        </span>
      </div>
    </div>

    <div class="gradient-divider" />

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
    // NativeAssetList,
    ModalLockdropWarning,
    // EvmNativeToken,
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

    const account_icon = {
      native: require('/src/assets/img/logo-polkadot-js.png'),
      evm: require('/src/assets/img/logo-eth-purple.svg'),
    };

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
      account_icon,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/account.scss';
</style>
