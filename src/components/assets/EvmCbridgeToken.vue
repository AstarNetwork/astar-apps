<template>
  <div>
    <div class="row" :class="isExpand && 'row--is-expand'">
      <div class="row__left" @click="isExpand = !isExpand">
        <div class="column--token">
          <div class="icon--token">
            <jazzicon
              v-if="tokenImg.includes('custom-token')"
              :address="token.address"
              :diameter="24"
            />
            <img v-else :src="tokenImg" :alt="token.name" class="token-logo" />
          </div>
          <div>
            <div class="text--title">{{ token.symbol }}</div>
            <div class="text--label">{{ formatTokenName(token.name) }}</div>
          </div>
        </div>

        <div class="column--balance">
          <div class="column--balance__row text--title">
            <div class="column--amount">
              {{ isTruncate ? $n(truncate(token.userBalance, 3)) : Number(token.userBalance) }}
            </div>
            <div class="column--symbol">
              {{ token.symbol }}
            </div>
          </div>
          <div class="column--balance__row text--label">
            <div class="column--amount">
              {{ $n(Number(token.userBalanceUsd)) }}
            </div>
            <div class="column--symbol">
              {{ $t('usd') }}
            </div>
          </div>
        </div>
      </div>

      <q-slide-transition :duration="150">
        <div v-show="isExpand || width >= screenSize.sm" class="row__right">
          <router-link :to="buildTransferPageLink(token.symbol)">
            <button class="btn btn--icon">
              <astar-icon-transfer />
            </button>
            <span class="text--expand-menu">{{ $t('assets.send') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.send') }}</span>
            </q-tooltip>
          </router-link>

          <a :href="cbridgeAppLink" target="_blank" rel="noopener noreferrer">
            <button class="btn btn--icon">
              <astar-icon-bridge class="icon--bridge" />
            </button>
            <span class="text--expand-menu">{{ $t('assets.bridge') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
            </q-tooltip>
          </a>

          <a :href="explorerLink" target="_blank" rel="noopener noreferrer">
            <button class="btn btn--icon">
              <astar-icon-external-link class="icon--external-link" />
            </button>
            <span class="text--expand-menu">{{ $t('blockscout') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('blockscout') }}</span>
            </q-tooltip>
          </a>

          <div>
            <button
              class="btn btn--icon"
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
              <astar-icon-base class="icon--plus">
                <astar-icon-plus />
              </astar-icon-base>
            </button>
            <span class="text--expand-menu">{{ $t('add') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.addToWallet') }}</span>
            </q-tooltip>
          </div>

          <!-- <div>
            <button class="btn btn--icon">
              <astar-icon-star class="icon--favorite" :class="isFavorite ? 'on' : 'off'" />
            </button>
            <span class="text--expand-menu">{{ $t('assets.favorite') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{
                $t(isFavorite ? 'assets.removeFromFavorite' : 'assets.addToFavorite')
              }}</span>
            </q-tooltip>
          </div> -->
        </div>
      </q-slide-transition>
    </div>
  </div>
</template>
<script lang="ts">
import { cbridgeAppLink } from 'src/c-bridge';
import { SupportWallet } from 'src/config/wallets';
import { addToEvmProvider, getEvmProvider } from 'src/hooks/helper/wallet';
import { Erc20Token, getErc20Explorer, getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref } from 'vue';
import { buildTransferPageLink } from 'src/router/routes';
import { useNetworkInfo, useBreakpoints } from 'src/hooks';
import Jazzicon from 'vue3-jazzicon/src/components';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { truncate } from '@astar-network/astar-sdk-core';

export default defineComponent({
  components: {
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    token: {
      type: Object as PropType<Erc20Token>,
      required: true,
    },
  },
  setup({ token }) {
    const isExpand = ref<boolean>(false);

    const tokenImg = computed(() =>
      getTokenImage({ isNativeToken: false, symbol: token.symbol, iconUrl: token.image })
    );

    const store = useStore();

    const formatTokenName = (name: string) => {
      switch (name) {
        case 'Shiden Network':
          return 'Shiden';
        default:
          return name;
      }
    };

    const { currentNetworkIdx, nativeTokenSymbol } = useNetworkInfo();

    const explorerLink = computed(() => {
      const tokenAddress = token.address;
      return getErc20Explorer({ currentNetworkIdx: currentNetworkIdx.value, tokenAddress });
    });

    const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);
    const provider = getEvmProvider(currentWallet.value);

    const { width, screenSize } = useBreakpoints();

    const isTruncate = !token.symbol.toUpperCase().includes('BTC');

    const isFavorite = ref<boolean>(false);

    return {
      tokenImg,
      nativeTokenSymbol,
      explorerLink,
      cbridgeAppLink,
      provider,
      width,
      screenSize,
      isExpand,
      isTruncate,
      isFavorite,
      truncate,
      buildTransferPageLink,
      formatTokenName,
      addToEvmProvider,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
