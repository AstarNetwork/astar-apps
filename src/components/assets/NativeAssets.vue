<template>
  <div class="container">
    <div class="row">
      <span class="text--title">{{ $t('assets.assets') }}</span>
    </div>

    <div class="border--separator" />

    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img width="24" src="icons/astar.png" alt="wallet-icon" />
            <div class="column--ticker">
              <span class="text--title">ASTR</span>
              <span class="text--label--accent">Astar</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="text--accent">
              <span>100,000.125 ASTR</span>
            </div>
            <div class="text--label">
              <span>100,000.125 USD</span>
            </div>
          </div>
          <div class="column column--buttons">
            <button class="btn btn--sm bg--astar">Transfer</button>
            <!-- Memo: activate it when bridge feature is available in the native network -->
            <!-- <button class="btn btn--sm bg--astar">Bridge</button> -->
            <!-- Memo: if eligible to call faucet -->
            <button class="btn btn--sm bg--astar">Faucet</button>
          </div>
        </div>
      </div>
      <!-- EVM deposit -->
      <div class="row--bg--extend row--details bg--accent">
        <div class="row__left">
          <span class="text--md">You have deposit from EVM account </span>
        </div>
        <div class="row__right">
          <span class="text--lg">100.125 ASTR</span>
        </div>
      </div>
      <!-- Vesting Info -->
      <div class="row--bg--extend row--details bg--accent">
        <div class="row__left">
          <span class="text--md">Your Vesting Info</span>
        </div>
        <div class="row__right">
          <!-- Memo: size change for laptop -->
          <span class="text--lg">600,000.125 ASTR</span>
        </div>
      </div>
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
@use 'src/components/assets/styles/native-assets.scss';
</style>
