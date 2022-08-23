<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <div class="token-logo">
              <jazzicon
                v-if="token.image.includes('custom-token')"
                :address="token.address"
                :diameter="24"
              />
              <img v-else :src="token.image" :alt="token.name" />
            </div>
            <div class="column--ticker">
              <span class="text--title">{{ token.symbol }}</span>
              <span class="text--label">{{ token.name }}</span>
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
            <div v-if="token.isXC20" />
            <router-link :to="transferLink">
              <button class="btn btn--sm">
                {{ $t('assets.manage') }}
              </button>
            </router-link>
            <div v-if="token.isWrappedToken && !token.isXC20">
              <a :href="token.wrapUrl" target="_blank" rel="noopener noreferrer">
                <button class="btn btn--sm">{{ $t('assets.wrap') }}</button>
              </a>
            </div>
            <div v-if="isImportedToken" />
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
                    image: token.image,
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
import { endpointKey } from 'src/config/chainEndpoints';
import { SupportWallet } from 'src/config/wallets';
import { useNetworkInfo } from 'src/hooks';
import { truncate } from 'src/hooks/helper/common';
import { addToEvmProvider, getEvmProvider } from 'src/hooks/helper/wallet';
import { Erc20Token, getErc20Explorer, getStoredERC20Tokens, MOVR } from 'src/modules/token';
import { Chain, xcmToken } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: {
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    token: {
      type: Object as PropType<Erc20Token>,
      required: true,
    },
    isXcm: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup({ token }) {
    const store = useStore();
    const { currentNetworkIdx, currentNetworkName } = useNetworkInfo();

    const explorerLink = computed(() => {
      const tokenAddress = token.address;
      return getErc20Explorer({ currentNetworkIdx: currentNetworkIdx.value, tokenAddress });
    });

    const isDisabledXcmButton = computed(() => {
      // Memo: Remove after runtime upgrading in shinde
      const isMovr = token.symbol === MOVR.symbol;
      const acalaTokens = xcmToken[currentNetworkIdx.value].filter(
        (it) => it.originChain === Chain.ACALA
      );
      // Memo: disabled until backend turns XCM transfer on again.
      const isAcalaToken = !!acalaTokens.find((it) => it.symbol === token.symbol);
      return isMovr || isAcalaToken;
    });

    const transferLink = computed<string>(() => {
      const symbol = token.symbol.toLowerCase();
      const network = currentNetworkName.value.toLowerCase();
      return `/assets/transfer?token=${symbol}&network=${network}&mode=local`;
    });

    const isImportedToken = computed<boolean>(
      () =>
        !!getStoredERC20Tokens().find(
          (it) => it.address.toLowerCase() === token.address.toLowerCase()
        )
    );

    const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);
    const provider = getEvmProvider(currentWallet.value);

    return {
      explorerLink,
      isImportedToken,
      provider,
      isDisabledXcmButton,
      transferLink,
      truncate,
      addToEvmProvider,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
