<template>
  <div class="row" :class="isExpand ? 'is-expand' : ''">
    <div class="row__left" @click="() => (isExpand = !isExpand)">
      <div class="column--currency">
        <div class="token-logo">
          <jazzicon
            v-if="tokenImg.includes('custom-token')"
            :address="token.address"
            :diameter="24"
          />
          <img v-else :src="tokenImg" :alt="token.name" />
        </div>
        <div>
          <div class="text--title">{{ token.symbol }}</div>
          <div class="ttext--label">{{ formatTokenName(token.name) }}</div>
        </div>
      </div>
      <div class="column--balance">
        <div class="text--title">
          <token-balance :balance="token.userBalance" :symbol="token.symbol" />
        </div>
        <div class="text--label">
          <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
        </div>
      </div>
    </div>

    <!-- for desktop -->
    <div class="row__right">
      <a :href="cbridgeAppLink" target="_blank" rel="noopener noreferrer">
        <button class="btn btn--sm">
          {{ $t('assets.bridge') }}
        </button>
      </a>
      <router-link :to="buildTransferPageLink(token.symbol)">
        <button class="btn btn--sm">
          {{ $t('assets.transfer') }}
        </button>
      </router-link>
      <div>
        <a class="box--explorer" :href="explorerLink" target="_blank" rel="noopener noreferrer">
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
      <div>
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
      <div>
        <button
          class="btn btn--sm btn--icon adjuster--width"
          @click="console.log('TODO: add to favorite action')"
        >
          <div class="icon--star">
            <span> ★ </span>
          </div>
        </button>
        <q-tooltip>
          <span class="text--tooltip">{{ $t('assets.addToWallet') }}</span>
        </q-tooltip>
      </div>
    </div>

    <!-- fot mobile/tablet -->
    <q-slide-transition :duration="150">
      <div v-show="isExpand" class="row__expand">
        <div class="row__expand-inner">
          <div class="icon-buttons">
            <button @click="console.log('TODO: add to favorite action')">
              <span> ★ </span>
            </button>
            <a :href="explorerLink" target="_blank" rel="noopener noreferrer">
              <button>
                <astar-icon-external-link />
              </button>
            </a>
            <button
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
              <span> + </span>
            </button>
          </div>
          <div class="text-buttons">
            <router-link :to="buildTransferPageLink(token.symbol)">
              <button class="btn btn--sm">
                {{ $t('assets.transfer') }}
              </button>
            </router-link>
            <a :href="cbridgeAppLink" target="_blank" rel="noopener noreferrer">
              <button class="btn btn--sm">
                {{ $t('assets.bridge') }}
              </button>
            </a>
          </div>
        </div>
      </div>
    </q-slide-transition>
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
import { useNetworkInfo } from 'src/hooks';
import Jazzicon from 'vue3-jazzicon/src/components';
import TokenBalance from 'src/components/common/TokenBalance.vue';

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
  },
  setup({ token }) {
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

    const isExpand = ref<boolean>(false);

    return {
      tokenImg,
      nativeTokenSymbol,
      explorerLink,
      cbridgeAppLink,
      provider,
      buildTransferPageLink,
      formatTokenName,
      addToEvmProvider,
      isExpand,
    };
  },
});
</script>

<style lang="scss" scoped>
// @use 'src/components/assets/styles/asset-list.scss';
@use 'src/components/assets/styles/asset-list-xcm.scss';
</style>
