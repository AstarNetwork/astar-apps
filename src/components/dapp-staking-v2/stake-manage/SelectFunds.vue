<template>
  <div class="container--select-item">
    <div class="row--title">
      <span>{{ $t('select') }}</span>
    </div>
    <div class="container--items">
      <div
        v-for="list in formattedStakingList"
        :key="list.address"
        class="row--item"
        @click="setAddressTransferFrom(list.address)"
      >
        <div class="column--item-name">
          <img :src="list.iconUrl" :alt="list.name" class="item-logo" />
          <span class="text--item-name">{{ list.name }}</span>
          <div class="column--amount">
            <span>
              <token-balance
                :balance="ethers.utils.formatEther(list.balance)"
                :symbol="nativeTokenSymbol"
              />
            </span>
          </div>
        </div>
        <div />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { StakingData } from 'src/modules/dapp-staking';
import { defineComponent, PropType, computed } from 'vue';
import { ethers } from 'ethers';
import { truncate } from 'src/hooks/helper/common';
import { useNetworkInfo } from 'src/hooks';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: {
    TokenBalance,
  },
  props: {
    setAddressTransferFrom: {
      type: Function,
      required: true,
    },
    stakingList: {
      type: Object as PropType<StakingData[]>,
      required: true,
    },
    dappAddress: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { nativeTokenSymbol } = useNetworkInfo();
    const formattedStakingList = computed<StakingData[]>(() => {
      if (!props.stakingList) return [];
      return props.stakingList
        .map((it: StakingData) => {
          const isDisplayingDapp = it.address.toLowerCase() === props.dappAddress.toLowerCase();
          return isDisplayingDapp ? undefined : it;
        })
        .filter((it) => it !== undefined) as StakingData[];
    });

    return { ethers, truncate, nativeTokenSymbol, formattedStakingList };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/select-funds.scss';
</style>
