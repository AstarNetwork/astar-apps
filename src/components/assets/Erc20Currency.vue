<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <img :src="token.image" :alt="token.name" class="token-logo" />
            <div class="column--ticker">
              <span class="text--title">{{ token.symbol }}</span>
              <span class="text--label">{{ token.name }}</span>
            </div>
          </div>
        </div>
        <div class="row__right">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>{{ $n(Number(token.userBalance)) }} {{ token.symbol }}</span>
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
                  currency: token,
                })
              "
            >
              {{ $t('assets.transfer') }}
            </button>
            <div v-if="token.isWrappedToken">
              <a :href="token.wrapUrl" target="_blank" rel="noopener noreferrer">
                <button class="btn btn--sm">{{ $t('assets.wrap') }}</button>
              </a>
            </div>
            <a :href="explorerLink" target="_blank" rel="noopener noreferrer" class="screen--xl">
              <button class="btn btn--sm">
                {{ $t('assets.explorer') }}
              </button>
            </a>
            <button
              class="btn btn--sm screen--md btn--icon"
              @click="
                addToEvmWallet({
                  tokenAddress: token.address,
                  symbol: token.symbol,
                  decimals: token.decimal,
                  image: token.image,
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
</template>
<script lang="ts">
import { getProviderIndex } from 'src/config/chainEndpoints';
import { addToEvmWallet } from 'src/hooks/helper/wallet';
import { Erc20Token, getErc20Explorer } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    token: {
      type: Object as PropType<Erc20Token>,
      required: true,
    },
    handleModalTransfer: {
      type: Function,
      required: true,
    },
  },
  setup({ token }) {
    const store = useStore();

    const explorerLink = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      const currentNetworkIdx = getProviderIndex(chain);
      const tokenAddress = token.address;
      return getErc20Explorer({ currentNetworkIdx, tokenAddress });
    });

    return {
      addToEvmWallet,
      explorerLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
