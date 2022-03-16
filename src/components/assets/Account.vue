<template>
  <div class="container">
    <div class="row">
      <span class="text--title">{{
        $t(isH160 ? 'assets.evmAccount' : 'assets.nativeAccount')
      }}</span>
      <span v-if="isEthWallet" class="text--switch-account" @click="toggleMetaMaskSchema">{{
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
              <span class="text--md">{{ $t('copy') }}</span>
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
              <span class="text--md">{{ $t(isH160 ? 'blockscout' : 'subscan') }}</span>
            </q-tooltip>
          </a>
        </div>
      </div>
    </div>

    <div class="border--separator" />

    <div class="row">
      <span>{{ $t('assets.totalBalance') }}</span>
      <!-- Todo: calculate total balance(usd) -->
      <span class="text--total-balance">
        {{ currentAccount ? '$30,123.233' : '$12,345.678' }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect, computed } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { SupportWallet, supportWalletObj } from 'src/config/wallets';
import { useStore } from 'src/store';
import { getSelectedAccount } from 'src/hooks/helper/wallet';
import { useAccount, useBreakpoints, useConnectWallet } from 'src/hooks';
import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';

export default defineComponent({
  setup() {
    const { toggleMetaMaskSchema } = useConnectWallet();
    const { currentAccount, currentAccountName } = useAccount();
    const { width, screenSize } = useBreakpoints();
    const iconWallet = ref<string>('');

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
