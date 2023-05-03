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
                <token-balance :balance="token.userBalance" :symbol="token.symbol" />
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--multi">
            <div v-if="token.isXC20" />
            <router-link :to="buildTransferPageLink(token.symbol)">
              <button class="btn btn--sm">
                {{ $t('assets.transfer') }}
              </button>
            </router-link>
            <div v-if="token.isWrappedToken && !token.isXC20">
              <a :href="token.wrapUrl" target="_blank" rel="noopener noreferrer">
                <button class="btn btn--sm">{{ $t('assets.wrap') }}</button>
              </a>
            </div>
            <div v-if="token.bridgeUrl">
              <a :href="token.bridgeUrl" target="_blank" rel="noopener noreferrer">
                <button class="btn btn--sm">{{ $t('assets.bridge') }}</button>
              </a>
            </div>
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
            <div v-if="isImportedToken" class="screen--xl">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import TokenBalance from 'src/components/common/TokenBalance.vue';
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
import { computed, defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
export default defineComponent({
  components: {
    [Jazzicon.name]: Jazzicon,
    TokenBalance,
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

    return {
      explorerLink,
      isImportedToken,
      provider,
      buildTransferPageLink,
      addToEvmProvider,
      handleDeleteStoredToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
