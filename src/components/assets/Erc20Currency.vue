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
                  currency: token,
                })
              "
            >
              {{ $t('assets.transfer') }}
            </button>
            <div v-if="token.isWrappedToken && !token.isXC20">
              <a :href="token.wrapUrl" target="_blank" rel="noopener noreferrer">
                <button class="btn btn--sm">{{ $t('assets.wrap') }}</button>
              </a>
            </div>

            <!-- Todo: We can add an action button for XC20 tokens here -->
            <div v-if="token.isXC20" />

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
  </div>
</template>
<script lang="ts">
import { getProviderIndex } from 'src/config/chainEndpoints';
import { addToEvmWallet } from 'src/hooks/helper/wallet';
import { Erc20Token, getErc20Explorer } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType } from 'vue';
import { truncate } from 'src/hooks/helper/common';

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
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
