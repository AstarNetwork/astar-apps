<template>
  <div data-testid="evm-native-token">
    <div
      v-for="(t, index) in astrTokens"
      :key="index"
      class="row row--hover row--transferable row--transferable-evm"
    >
      <div class="row__info">
        <div class="column--token-name">
          <img class="token-logo" :src="t.image" :alt="t.symbol" />
          <span class="text--title">{{ t.symbol }}</span>
        </div>
        <div class="column--balance-evm">
          <div class="column--balance__row text--title">
            <div class="column--amount">
              {{ $n(truncate(Number(t.userBalance), 3)) }}
            </div>
            <div class="column--symbol">
              {{ t.symbol }}
            </div>
          </div>

          <div class="column--balance__row text--label">
            <div class="column--amount">
              {{ $n(Number(t.userBalanceUsd)) }}
            </div>
            <div class="column--symbol">
              {{ $t('usd') }}
            </div>
          </div>
        </div>
      </div>

      <div class="row__actions-multi">
        <router-link :to="buildTransferPageLink(t.symbol)" class="box--icon">
          <button class="btn btn--icon">
            <astar-icon-transfer />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </router-link>

        <custom-router-link
          v-if="t.symbol === 'ASTR'"
          :to="buildLzBridgePageLink()"
          :is-disabled="!layerZeroBridgeEnabled"
          class="box--icon"
        >
          <button class="btn btn--icon">
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </custom-router-link>

        <custom-router-link
          v-else
          :to="vAstrOmniLink"
          :is-disabled="!omniBridgeEnabled"
          class="box--icon"
        >
          <button class="btn btn--icon">
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.swap') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.swap') }}</span>
          </q-tooltip>
        </custom-router-link>

        <a
          :href="getExplorerLink(t.address)"
          target="_blank"
          rel="noopener noreferrer"
          class="box--icon"
        >
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
        <div class="box--icon">
          <button
            class="btn btn--icon"
            @click="
              addToEvmProvider({
                tokenAddress: t.address,
                symbol: t.symbol,
                decimals: t.decimal,
                image: String(t.image),
                provider: ethProvider,
              })
            "
          >
            <div class="icon-helper box--icon">
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
import { buildTransferPageLink, buildLzBridgePageLink } from 'src/router/routes';
import { PropType, defineComponent } from 'vue';
import { vAstrOmniLink } from '../../modules/zk-evm-bridge';
import CustomRouterLink from 'src/components/common/CustomRouterLink.vue';
import { layerZeroBridgeEnabled, omniBridgeEnabled } from 'src/features';

export default defineComponent({
  components: { CustomRouterLink },
  props: {
    astrTokens: {
      type: Array as PropType<Erc20Token[]>,
      required: true,
    },
  },
  setup(props) {
    const { currentNetworkIdx } = useNetworkInfo();
    const { ethProvider } = useEthProvider();

    const getExplorerLink = (tokenAddress: string): string => {
      return getErc20Explorer({ currentNetworkIdx: currentNetworkIdx.value, tokenAddress });
    };

    return {
      ethProvider,
      buildLzBridgePageLink,
      vAstrOmniLink,
      truncate,
      addToEvmProvider,
      buildTransferPageLink,
      getExplorerLink,
      layerZeroBridgeEnabled,
      omniBridgeEnabled,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
