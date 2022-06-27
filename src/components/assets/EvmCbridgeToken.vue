<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img :src="tokenImg" :alt="token.name" class="token-logo" />
            <div class="column--ticker">
              <span class="text--title">{{ token.symbol }}</span>
              <span class="text--label">{{ formatTokenName(token.name) }}</span>
            </div>
          </div>
        </div>
        <div class="row__right row__right--evm">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>{{ $n(truncate(token.userBalance)) }} {{ token.symbol }}</span>
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--multi">
            <button
              class="btn btn--sm"
              @click="
                handleModalTransfer({
                  isOpen: true,
                  currency: token.symbol === nativeTokenSymbol ? nativeTokenSymbol : token,
                })
              "
            >
              {{ $t('assets.transfer') }}
            </button>
            <a :href="cbridgeAppLink" target="_blank" rel="noopener noreferrer">
              <button class="btn btn--sm">
                {{ $t('assets.bridge') }}
              </button>
            </a>

            <div class="screen--xl">
              <a
                class="box--explorer"
                :href="explorerLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button class="btn btn--sm btn--explorer adjuster--width">
                  <div class="container--explorer-icon adjuster--width">
                    <astar-icon-external-link />
                  </div>
                </button>
              </a>
              <q-tooltip>
                <span class="text--tooltip">{{ $t('blockscout') }}</span>
              </q-tooltip>
            </div>

            <div class="screen--md">
              <button
                class="btn btn--sm btn--icon adjuster--width"
                @click="
                  addToEvmProvider({
                    tokenAddress: token.address,
                    symbol: token.symbol,
                    decimals: token.decimal,
                    image: tokenImg,
                    provider,
                  })
                "
              >
                <div class="icon--plus">
                  <span> + </span>
                </div>
                <q-tooltip>
                  <span class="text--tooltip">{{ $t('assets.addToWallet') }}</span>
                </q-tooltip>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { SelectedToken } from 'src/c-bridge';
import { getProviderIndex } from 'src/config/chainEndpoints';
import { getChainId } from 'src/config/web3';
import { addToEvmProvider } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { getErc20Explorer, getTokenImage } from 'src/modules/token';
import { computed, defineComponent, PropType } from 'vue';
import { truncate } from 'src/hooks/helper/common';
import { cbridgeAppLink } from 'src/c-bridge';
import { SupportWallet } from 'src/config/wallets';

export default defineComponent({
  props: {
    token: {
      type: Object as PropType<SelectedToken>,
      required: true,
    },
    handleModalTransfer: {
      type: Function,
      required: true,
    },
  },
  setup({ token }) {
    const tokenImg = computed(() =>
      getTokenImage({ isNativeToken: false, symbol: token.symbol, iconUrl: token.icon })
    );

    const store = useStore();
    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const formatTokenName = (name: string) => {
      switch (name) {
        case 'Shiden Network':
          return 'Shiden';
        default:
          return name;
      }
    };

    const explorerLink = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      const currentNetworkIdx = getProviderIndex(chain);
      const tokenAddress = token.address;
      return getErc20Explorer({ currentNetworkIdx, tokenAddress });
    });

    const currentWallet = computed(() => store.getters['general/currentWallet']);

    let provider;

    if (
      typeof window.ethereum !== 'undefined' &&
      window.ethereum &&
      currentWallet.value === SupportWallet.MetaMask
    ) {
      provider = window.ethereum;
    }

    if (
      typeof window.talismanEth !== 'undefined' &&
      window.talismanEth &&
      currentWallet.value === SupportWallet.TalismanEvm
    ) {
      provider = window.talismanEth;
    }

    if (
      typeof window.SubWallet !== 'undefined' &&
      window.SubWallet &&
      currentWallet.value === SupportWallet.SubWalletEvm
    ) {
      provider = window.SubWallet;
    }

    if (!provider) {
      throw new Error("Can't find provider");
    }

    return {
      formatTokenName,
      addToEvmProvider,
      tokenImg,
      nativeTokenSymbol,
      explorerLink,
      cbridgeAppLink,
      truncate,
      provider,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
