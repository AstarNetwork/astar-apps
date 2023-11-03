<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectToken') }}</span>
    </div>
    <div class="box__column--input-token">
      <div class="box--input-field box--hover--active">
        <input
          :value="importTokenAddress"
          placeholder="Token Address"
          class="input--token"
          @input="(e) => inputImportTokenHandler(e)"
        />
      </div>
    </div>
    <div v-if="!importTokenAddress" class="container--items">
      <div v-for="(token, index) in tokens" :key="index" class="row--item" @click="setToken(token)">
        <div class="column--item-name">
          <!-- <jazzicon
            v-if="token.tokenImage === 'custom-token'"
            :address="token.address"
            :diameter="24"
            class="item-logo"
          /> -->
          <jazzicon :address="token.address" :diameter="24" class="item-logo" />
          <!-- <img
            v-else
            :src="token.tokenImage"
            :alt="token.metadata.symbol"
            :class="[
              token.metadata.symbol === nativeTokenSymbol ? 'native-token-logo' : 'item-logo',
            ]"
          /> -->
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
    <div v-else>
      <import-token-info
        :import-token-address="importTokenAddress"
        :from-chain-id="fromChainId"
        :from-chain-name="fromChainName"
        :to-chain-name="toChainName"
        :set-zk-tokens="setZkTokens"
        :tokens="tokens"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { truncate } from '@astar-network/astar-sdk-core';
import { ZkToken } from 'src/modules/zk-evm-bridge';
import { defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import ImportTokenInfo from 'src/components/bridge/common/ImportTokenInfo.vue';

export default defineComponent({
  components: {
    ImportTokenInfo,
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
    importTokenAddress: {
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
    setZkTokens: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<ZkToken[]>,
      required: true,
    },
  },
  setup() {
    return { truncate, getShortenAddress };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/common/styles/select-token.scss';
</style>
