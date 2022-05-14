<template>
  <div>
    <div class="border--separator" />
    <div class="rows">
      <div class="row row--details">
        <div class="row__left">
          <div class="column--currency">
            <!-- <img :src="tokenImg" :alt="token.name" class="token-logo" /> -->
            <div class="column--ticker">
              <span class="text--title">{{ token.metadata.symbol }}</span>
              <span class="text--label">{{ token.metadata.name }}</span>
            </div>
          </div>
        </div>
        <div class="row__right row__right--evm">
          <div class="column column--balance">
            <div class="column__box">
              <div class="text--accent">
                <span>{{ token.deposit }} {{ token.metadata.symbol }}</span>
              </div>
              <!-- <div class="text--label">
                <span>{{ $n(Number(token.userBalanceUsd)) }} {{ $t('usd') }}</span>
              </div> -->
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
            <router-link
              :to="{
                path: '/xcm',
                query: { from: sourceChainId, symbol: token.metadata.symbol },
              }"
            >
              <button class="btn btn--sm">
                {{ $t('assets.xcm') }}
              </button>
            </router-link>

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
                    tokenAddress: token.mappedERC20Addr,
                    symbol: token.metadata.symbol,
                    decimals: token.metadata.decimals,
                    image: '',
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
import { addToEvmWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { getErc20Explorer, getTokenImage } from 'src/modules/token';
import { computed, defineComponent, PropType } from 'vue';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';

export default defineComponent({
  props: {
    token: {
      type: Object as PropType<ChainAsset>,
      required: true,
    },
    handleModalTransfer: {
      type: Function,
      required: true,
    },
  },
  setup({ token }) {
    // const tokenImg = computed(() =>
    //   getTokenImage({ isNativeToken: false, symbol: token.symbol, iconUrl: token.icon })
    // );

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

    // const sourceChainId = computed(() => {
    //   const chainInfo = store.getters['general/chainInfo'];
    //   const chain = chainInfo ? chainInfo.chain : '';
    //   const networkIdx = getProviderIndex(chain);
    //   const chainId = token.canonicalConfig
    //     ? token.canonicalConfig && token.canonicalConfig.org_chain_id
    //     : String(getChainId(networkIdx));
    //   return chainId;
    // });

    const explorerLink = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      const currentNetworkIdx = getProviderIndex(chain);
      const tokenAddress = token.owner.toString();
      return getErc20Explorer({ currentNetworkIdx, tokenAddress });
    });

    return {
      formatTokenName,
      addToEvmWallet,
      // tokenImg,
      nativeTokenSymbol,
      // sourceChainId,
      explorerLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
