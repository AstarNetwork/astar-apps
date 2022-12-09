<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectToken') }}</span>
    </div>
    <div class="container--items">
      <div
        v-for="token in tokens"
        :key="token.erc20Contract"
        class="row--item"
        @click="setToken(token)"
      >
        <div class="column--item-name">
          <div class="item-logo">
            <jazzicon :address="token.erc20Contract" :diameter="24" />
          </div>
          <span class="text--item-name">{{ token.symbol }}</span>
        </div>
        <div class="column--item-name">
          <span class="text--token-amount">
            {{
              $t('amountToken', {
                amount: truncate(Number(token.userBalance)),
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
import { truncate } from 'src/hooks/helper/common';
import { XvmAsset } from 'src/modules/token';
import { defineComponent, PropType } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: { [Jazzicon.name]: Jazzicon },
  props: {
    setToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<XvmAsset[]>,
      required: true,
    },
  },
  setup() {
    return { truncate };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
