<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectToken') }}</span>
    </div>
    <div class="container--items">
      <div v-for="token in tokens" :key="token.id" class="row--item" @click="setToken(token)">
        <div class="column--item-name">
          <jazzicon
            v-if="token.tokenImage === 'custom-token'"
            :address="token.mappedERC20Addr"
            :diameter="24"
            class="item-logo"
          />
          <img
            v-else
            :src="token.tokenImage"
            :alt="token.metadata.symbol"
            :class="[
              token.metadata.symbol === nativeTokenSymbol ? 'native-token-logo' : 'item-logo',
            ]"
          />
          <span class="text--item-name">{{ token.metadata.symbol }}</span>
        </div>
        <div class="column--item-name">
          <span class="text--token-amount">
            {{
              $t('amountToken', {
                amount: $n(truncate(token.userBalance)),
                token: token.metadata.symbol,
              })
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { truncate } from 'src/hooks/helper/common';
import { Asset } from 'src/v2/models';
import { defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';
export default defineComponent({
  components: {
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    setToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<Asset[]>,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    return { nativeTokenSymbol, truncate };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
