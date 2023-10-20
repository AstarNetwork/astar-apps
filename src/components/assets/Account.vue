<template>
  <div class="wrapper--account">
    <div class="container container--account">
      <div class="row--account-info">
        <div class="column--account-icon">
          <img
            v-if="iconWallet"
            width="24"
            :src="iconWallet"
            alt="wallet-icon"
            :class="multisig && 'img--polkasafe'"
          />
        </div>

        <div>
          <div class="text--title">
            <span>{{ currentAccount ? currentAccountName : $t('assets.myWallet') }}</span>
          </div>
          <div class="text--balance">
            {{ $n(totalBal) }}
            <span>USD</span>
          </div>
        </div>
      </div>

      <div class="row--actions">
        <div v-if="isAccountUnification">
          <button class="btn--icon" @click="showAccountUnificationModal()">
            <astar-icon-person />
          </button>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.unifyAccounts') }}</span>
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

    <div v-if="isH160" class="container">
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

    <div v-if="!isH160" class="container">
      <native-asset-list />
    </div>
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
import { ETHEREUM_EXTENSION } from 'src/hooks';
import { supportWalletObj } from 'src/config/wallets';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import EvmNativeToken from 'src/components/assets/EvmNativeToken.vue';

export default defineComponent({
  components: {
    NativeAssetList,
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
    const {
      currentAccount,
      currentAccountName,
      multisig,
      showAccountUnificationModal,
      isAccountUnification,
    } = useAccount();
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
        } catch (error: any) {
          console.error(error.message);
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
      isSkeleton,
      totalBal,
      ETHEREUM_EXTENSION,
      multisig,
      supportWalletObj,
      signatoryIconWallet,
      isAccountUnification,
      getShortenAddress,
      copyAddress,
      showAccountUnificationModal,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/account.scss';
</style>
