<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectToken') }}</span>
    </div>
    <div class="container--items">
      <div v-for="(token, index) in tokens" :key="index" class="row--item" @click="setToken(token)">
        <div class="column--item-name">
          <img
            v-if="token.image !== ''"
            :src="token.image"
            :alt="token.symbol"
            class="native-token-logo"
          />
          <jazzicon v-else :address="token.symbol" :diameter="24" class="item-logo" />

          <span class="text--item-name">{{ token.symbol }}</span>
        </div>
        <div class="column--item-name">
          <span class="text--token-amount">
            {{
              $t('amountToken', {
                amount: $n(truncate(token.fromChainBalance ?? 0)),
                token: token.symbol,
              })
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import { EthBridgeNetworkName, ZkToken, zkBridgeIcon } from 'src/modules/zk-evm-bridge';
import { getShortNetworkName } from 'src/modules/zk-evm-bridge';
import { LayerZeroToken } from '../../../modules/zk-evm-bridge/layerzero/index';

export default defineComponent({
  components: {
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    fromChainId: {
      type: Number,
      required: true,
    },
    fromChainName: {
      type: String,
      required: true,
    },
    toChainName: {
      type: String,
      required: true,
    },
    inputImportTokenHandler: {
      type: Function,
      required: true,
    },
    setToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<LayerZeroToken[]>,
      required: true,
    },
  },
  setup() {
    return { EthBridgeNetworkName, zkBridgeIcon, getShortNetworkName, truncate, getShortenAddress };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/layerzero/styles/select-token.scss';
</style>
