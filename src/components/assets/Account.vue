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
      <div class="row">
        <span class="text--title">{{
          $t(
            isH160
              ? 'assets.evmAccount'
              : isLockdropAccount
              ? 'assets.lockdropAccount'
              : 'assets.nativeAccount'
          )
        }}</span>
        <span v-if="isLockdropAccount" class="text--switch-account" @click="toggleMetaMaskSchema">{{
          $t(isH160 ? 'assets.switchToNative' : 'assets.switchToEvm')
        }}</span>
      </div>

      <div class="border--separator" />

      <div class="row--details">
        <div class="column-account-name">
          <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
          <span class="text--accent">{{ currentAccount ? currentAccountName : 'My Wallet' }}</span>
        </div>
        <div class="column-address-icons">
          <div class="column__address">
            <span>{{
              width >= screenSize.xl ? currentAccount : getShortenAddress(currentAccount)
            }}</span>
          </div>
          <div class="column__icons">
            <div>
              <img
                class="icon"
                :src="isDarkTheme ? 'icons/icon-copy-dark.svg' : 'icons/icon-copy.svg'"
                @click="copyAddress"
              />
              <q-tooltip>
                <span class="text--tooltip">{{ $t('copy') }}</span>
              </q-tooltip>
            </div>
            <a :href="isH160 ? blockscout : subScan" target="_blank" rel="noopener noreferrer">
              <img
                class="icon"
                :src="
                  isDarkTheme ? 'icons/icon-external-link-dark.svg' : 'icons/icon-external-link.svg'
                "
              />
              <q-tooltip>
                <span class="text--tooltip">{{ $t(isH160 ? 'blockscout' : 'subscan') }}</span>
              </q-tooltip>
            </a>
          </div>
        </div>
      </div>

      <div class="border--separator" />

      <div class="row">
        <span>{{ $t('assets.totalBalance') }}</span>
        <span class="text--total-balance"> ${{ $n(balUsd + ttlErc20Amount) }} </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect, computed, watch } from 'vue';
import {
  setAddressMapping,
  getEvmMappedSs58Address,
  getShortenAddress,
} from 'src/hooks/helper/addressUtils';
import { SupportWallet, supportWalletObj } from 'src/config/wallets';
import { useStore } from 'src/store';
import { getSelectedAccount } from 'src/hooks/helper/wallet';
import { useAccount, useBalance, useBreakpoints, useConnectWallet, usePrice } from 'src/hooks';
import { endpointKey, getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { isValidEvmAddress } from 'src/config/web3';
import { useMetamask } from 'src/hooks/custom-signature/useMetamask';

export default defineComponent({
  props: {
    ttlErc20Amount: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const { toggleMetaMaskSchema } = useConnectWallet();
    const { currentAccount, currentAccountName } = useAccount();
    const { width, screenSize } = useBreakpoints();
    const iconWallet = ref<string>('');
    const balUsd = ref<number>(0);
    const isCheckingSignature = ref<boolean>(false);
    const isLockdropAccount = ref<boolean>(false);
    const { balance } = useBalance(currentAccount);
    const { nativeTokenUsd } = usePrice();
    const { requestSignature } = useMetamask();

    const store = useStore();
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });
    const blockscout = computed(
      () =>
        `${providerEndpoints[currentNetworkIdx.value].blockscout}/address/${currentAccount.value}`
    );
    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${currentAccount.value}`
    );

    const copyAddress = async () => {
      await navigator.clipboard.writeText(currentAccount.value);
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy address success!!',
        alertType: 'success',
      });
    };

    watchEffect(() => {
      const account = getSelectedAccount(substrateAccounts.value);
      if (!currentAccount.value) {
        // Memo: placeholder
        iconWallet.value = supportWalletObj[SupportWallet.PolkadotJs].img;
      } else if (isEthWallet.value) {
        iconWallet.value = supportWalletObj[SupportWallet.MetaMask].img;
      } else if (account) {
        // @ts-ignore
        iconWallet.value = supportWalletObj[account.source].img;
      }
    });

    watch(
      [balance, nativeTokenUsd, currentAccount, isH160],
      () => {
        balUsd.value = 0;
        const isEvmShiden = currentNetworkIdx.value === endpointKey.SHIDEN && isH160.value;
        if (!balance.value || !nativeTokenUsd.value || isEvmShiden) return;

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
        console.log(error.message);
      } finally {
        isCheckingSignature.value = false;
      }
    });

    watch(
      [isH160, isCheckingSignature, isEthWallet],
      async () => {
        const apiRef = $api.value;
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
          const { data } = await apiRef.query.system.account(ss58);
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
      width,
      isDarkTheme,
      screenSize,
      isH160,
      isEthWallet,
      balUsd,
      isLockdropAccount,
      getShortenAddress,
      copyAddress,
      toggleMetaMaskSchema,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/account.scss';
</style>
