<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <jazzicon
              v-if="tokenImg.includes('custom-token')"
              :address="token.address"
              :diameter="24"
            />
            <img v-else :src="tokenImg" :alt="token.name" class="token-logo" />
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
                <token-balance :balance="token.userBalance" :symbol="token.symbol" />
              </div>
              <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div>
            </div>
          </div>
          <div class="column--asset-buttons column--buttons--multi">
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
import { cbridgeAppLink } from 'src/c-bridge';
import { SupportWallet } from 'src/config/wallets';
import { addToEvmProvider, getEvmProvider } from 'src/hooks/helper/wallet';
import { Erc20Token, getErc20Explorer, getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType } from 'vue';
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

    return {
      tokenImg,
      nativeTokenSymbol,
      explorerLink,
      cbridgeAppLink,
      provider,
      buildTransferPageLink,
      formatTokenName,
      addToEvmProvider,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
