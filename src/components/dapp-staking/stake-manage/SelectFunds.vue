<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('assets.transferPage.selectChain') }}</span>
    </div>
    <div class="container--items">
      <div
        v-for="list in stakingList"
        :key="list.address"
        class="row--item"
        @click="setAddressTransferFrom(list.address)"
      >
        <div class="column--item-name">
          <img :src="list.iconUrl" :alt="list.name" class="item-logo" />
          <span class="text--item-name">{{ list.name }}</span>
          <div class="column--amount">
            <span>{{
              $t('amountSymbol', {
                amount: $n(truncate(ethers.utils.formatEther(list.balance))),
                symbol: nativeTokenSymbol,
              })
            }}</span>
          </div>
        </div>
        <div />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { StakingData } from 'src/modules/dapp-staking';
import { defineComponent, PropType } from 'vue';
import { ethers } from 'ethers';
import { truncate } from 'src/hooks/helper/common';
import { useNetworkInfo } from 'src/hooks';
export default defineComponent({
  props: {
    setAddressTransferFrom: {
      type: Function,
      required: true,
    },
    stakingList: {
      type: Object as PropType<StakingData[]>,
      required: true,
    },
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    return { ethers, truncate, nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/select-funds.scss';
</style>
