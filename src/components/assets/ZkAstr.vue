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

      <div class="row__actions">
        <router-link :to="buildTransferPageLink(t.symbol)">
          <button class="btn btn--icon">
            <astar-icon-transfer />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.send') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.send') }}</span>
          </q-tooltip>
        </router-link>

        <a v-if="t.symbol === 'ASTR'" :href="stargateUrl" target="_blank" rel="noopener noreferrer">
          <button class="btn btn--icon">
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.bridge') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.bridge') }}</span>
          </q-tooltip>
        </a>

        <a v-else :href="vAstrOmniLink" target="_blank" rel="noopener noreferrer">
          <button class="btn btn--icon">
            <astar-icon-bridge />
          </button>
          <span class="text--mobile-menu">{{ $t('assets.swap') }}</span>
          <q-tooltip>
            <span class="text--tooltip">{{ $t('assets.swap') }}</span>
          </q-tooltip>
        </a>

        <a :href="getExplorerLink(t.address)" target="_blank" rel="noopener noreferrer">
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
                tokenAddress: t.address,
                symbol: t.symbol,
                decimals: t.decimal,
                image: String(t.image),
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
import { buildTransferPageLink } from 'src/router/routes';
import { PropType, defineComponent } from 'vue';
import { stargateUrl, vAstrOmniLink } from '../../modules/zk-evm-bridge';

export default defineComponent({
  components: {},
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
      stargateUrl,
      vAstrOmniLink,
      truncate,
      addToEvmProvider,
      buildTransferPageLink,
      getExplorerLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
