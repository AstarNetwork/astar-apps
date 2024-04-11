<template>
  <div data-testid="evm-native-token">
    <div class="row row--transferable row--transferable-evm">
      <div class="row__info">
        <div class="column--token-name">
          <img class="token-logo" :src="astr.image" :alt="astr.symbol" />
          <span class="text--title">{{ astr.symbol }}</span>
        </div>
        <div class="column--balance-evm">
          <div class="column--balance__row text--title">
            <div class="column--amount">
              {{ $n(truncate(Number(astr.userBalance), 3)) }}
            </div>
            <div class="column--symbol">
              {{ astr.symbol }}
            </div>
          </div>

          <div class="column--balance__row text--label">
            <div class="column--amount">
              {{ $n(Number(astr.userBalanceUsd)) }}
            </div>
            <div class="column--symbol">
              {{ $t('usd') }}
            </div>
          </div>
        </div>
      </div>

      <div class="row__actions">
        <router-link :to="buildTransferPageLink(astr.symbol)">
          <button class="btn btn--icon">
            <astar-icon-transfer />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </router-link>

        <a :href="stargateUrl" target="_blank" rel="noopener noreferrer">
          <button class="btn btn--icon">
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </a>

        <a :href="explorerLink" target="_blank" rel="noopener noreferrer">
          <button class="btn btn--icon">
            <div class="icon-helper">
              <astar-icon-external-link class="icon--external-link" />
            </div>
          </button>
          <span class="text--mobile-menu">{{ $t('blockscout') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('blockscout') }}</span>
          </q-tooltip>
        </a>
        <div>
          <button
            class="btn btn--icon"
            @click="
              addToEvmProvider({
                tokenAddress: astr.address,
                symbol: astr.symbol,
                decimals: astr.decimal,
                image: String(astr.image),
                provider: ethProvider,
              })
            "
          >
            <div class="icon-helper">
              <astar-icon-base class="icon--plus">
                <astar-icon-plus />
              </astar-icon-base>
            </div>
          </button>
          <span class="text--mobile-menu">{{ $t('add') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.addToWallet') }}</span>
          </q-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { useNetworkInfo } from 'src/hooks';
import { useEthProvider } from 'src/hooks/custom-signature/useEthProvider';
import { addToEvmProvider } from 'src/hooks/helper/wallet';
import { Erc20Token, getErc20Explorer } from 'src/modules/token';
import { PropType, computed, defineComponent } from 'vue';
import { buildTransferPageLink } from 'src/router/routes';
import { stargateUrl } from '../../modules/zk-evm-bridge/index';

export default defineComponent({
  components: {},
  props: {
    astr: {
      type: Object as PropType<Erc20Token>,
      required: true,
    },
  },
  setup(props) {
    const { currentNetworkIdx } = useNetworkInfo();
    const { ethProvider } = useEthProvider();

    const explorerLink = computed(() => {
      const tokenAddress = props.astr.address;
      return getErc20Explorer({ currentNetworkIdx: currentNetworkIdx.value, tokenAddress });
    });

    return {
      explorerLink,
      ethProvider,
      stargateUrl,
      truncate,
      addToEvmProvider,
      buildTransferPageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
