<template>
  <div>
    <div class="row" :class="isExpand && 'row--is-expand'">
      <div class="row__left" @click="isExpand = !isExpand">
        <div class="column--token">
          <div class="icon--token">
            <jazzicon
              v-if="token.image.includes('custom-token')"
              :address="token.address"
              :diameter="24"
            />
            <img v-else :src="token.image" :alt="token.name" />
          </div>
          <div>
            <div class="text--title">{{ token.symbol }}</div>
            <div class="text--label">{{ token.name }}</div>
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
          <!-- Memo: test checking if styling won't break -->
          <!-- <div v-if="token.isXC20" /> -->

          <div>
            <router-link :to="buildTransferPageLink(token.symbol)">
              <button class="btn btn--icon">
                <astar-icon-transfer />
              </button>
            </router-link>
            <span class="text--expand-menu">{{ $t('assets.send') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.send') }}</span>
            </q-tooltip>
          </div>

          <div v-if="token.isWrappedToken && !token.isXC20">
            <a :href="token.wrapUrl" target="_blank" rel="noopener noreferrer">
              <button class="btn btn--icon">
                <astar-icon-bridge class="icon--bridge" />
              </button>
            </a>
            <span class="text--expand-menu">{{ $t('assets.wrap') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.wrap') }}</span>
            </q-tooltip>
          </div>

          <div>
            <a :href="explorerLink" target="_blank" rel="noopener noreferrer">
              <button class="btn btn--icon">
                <astar-icon-external-link class="icon--external-link" />
              </button>
            </a>
            <span class="text--expand-menu">{{ $t('blockscout') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('blockscout') }}</span>
            </q-tooltip>
          </div>

          <div>
            <button
              class="btn btn--icon"
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
              <astar-icon-base class="icon--plus">
                <astar-icon-plus />
              </astar-icon-base>
            </button>
            <span class="text--expand-menu">{{ $t('add') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('assets.addToWallet') }}</span>
            </q-tooltip>
          </div>

          <div v-if="isImportedToken">
            <button
              class="btn btn--sm btn--delete adjuster--width"
              @click="handleDeleteStoredToken(token.address)"
            >
              <div class="adjuster--width icon--delete">
                <astar-icon-delete size="22" />
              </div>
            </button>
            <q-tooltip>
              <span class="text--tooltip">{{ $t('remove') }}</span>
            </q-tooltip>
          </div>

          <div>
            <!-- TODO: add logic -->
            <button class="btn btn--icon">
              <astar-icon-star class="icon--favorite" :class="isFavorite ? 'on' : 'off'" />
            </button>
            <span class="text--expand-menu">{{ $t('assets.favorite') }}</span>
            <q-tooltip>
              <span class="text--tooltip">{{
                $t(isFavorite ? 'assets.removeFromFavorite' : 'assets.addToFavorite')
              }}</span>
            </q-tooltip>
          </div>
        </div>
      </q-slide-transition>
    </div>
  </div>
</template>
<script lang="ts">
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { SupportWallet } from 'src/config/wallets';
import { useNetworkInfo } from 'src/hooks';
import { addToEvmProvider, getEvmProvider } from 'src/hooks/helper/wallet';
import {
  deleteImportedErc20Token,
  Erc20Token,
  getErc20Explorer,
  getStoredERC20Tokens,
} from 'src/modules/token';
import { buildTransferPageLink } from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import { useBreakpoints } from 'src/hooks';
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
    isXcm: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup({ token }) {
    const isExpand = ref<boolean>(false);
    const { width, screenSize } = useBreakpoints();

    const store = useStore();
    const { currentNetworkIdx, evmNetworkIdx } = useNetworkInfo();

    const explorerLink = computed(() => {
      const tokenAddress = token.address;
      return getErc20Explorer({ currentNetworkIdx: currentNetworkIdx.value, tokenAddress });
    });

    const isImportedToken = computed<boolean>(
      () =>
        !!getStoredERC20Tokens().find(
          (it) =>
            it.address.toLowerCase() === token.address.toLowerCase() &&
            evmNetworkIdx.value === it.srcChainId
        )
    );

    const currentWallet = computed<SupportWallet>(() => store.getters['general/currentWallet']);
    const provider = getEvmProvider(currentWallet.value);

    const handleDeleteStoredToken = (tokenAddress: string): void => {
      deleteImportedErc20Token({ srcChainId: evmNetworkIdx.value, tokenAddress });
      window.dispatchEvent(new CustomEvent(LOCAL_STORAGE.EVM_TOKEN_IMPORTS));
    };

    const isTruncate = !token.symbol.toUpperCase().includes('BTC');

    const isFavorite = ref<boolean>(false);

    return {
      explorerLink,
      isImportedToken,
      provider,
      isExpand,
      width,
      screenSize,
      isTruncate,
      isFavorite,
      truncate,
      buildTransferPageLink,
      addToEvmProvider,
      handleDeleteStoredToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
