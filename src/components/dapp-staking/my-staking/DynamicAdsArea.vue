<template>
  <div class="wrapper">
    <div class="wrapper-item news-area">
      <news-area />
    </div>
    <div class="wrapper-item wrapper--banners" :class="isShiden && 'wrapper--shiden'">
      <div
        v-for="(t, index) in items"
        :key="index"
        class="card"
        :style="
          t.gradient
            ? `background: linear-gradient(180deg, ${t.gradient[0]} 0%, ${t.gradient[1]} 100%)`
            : ''
        "
        @click="goToLink(t.link)"
      >
        <div class="wrapper--img">
          <q-img :src="sourceImg(t.img, index)" class="img--dapp" fit="contain" no-spinner />
        </div>
        <div class="card-info">
          <div class="txt--category">{{ t.category }}</div>
          <div class="txt--title">
            {{
              index === 0 ? $n(truncate(rewardsDeveloper, 0)) + ' ' + nativeTokenSymbol : t.title
            }}
          </div>
          <div class="txt--subtitle">{{ t.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect, computed } from 'vue';
import { Struct } from '@polkadot/types';
import { Perbill } from '@polkadot/types/interfaces';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { truncate } from '@astar-network/astar-sdk-core';
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import NewsArea from './components/NewsArea.vue';
import featuredData from 'src/data/featured_dapp.json';

interface RewardDistributionConfig extends Struct {
  readonly baseTreasuryPercent: Perbill;
  readonly baseStakerPercent: Perbill;
  readonly dappsPercent: Perbill;
  readonly collatorsPercent: Perbill;
  readonly adjustablePercent: Perbill;
  readonly idealDappsStakingTvl: Perbill;
}

export default defineComponent({
  components: {
    NewsArea,
  },
  setup() {
    const items = featuredData;
    const rewardsDeveloper = ref<number>(0);
    const { nativeTokenSymbol, currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);

    const goToLink = (link: string) => {
      window.open(link, '_blank');
    };

    const calcDeveloperRewards = async (): Promise<void> => {
      try {
        const api = $api!;
        const [rewardsAllocation, rewardsAmount, blockPerEra] = await Promise.all([
          api.query.blockReward.rewardDistributionConfigStorage<RewardDistributionConfig>(),
          api.consts.blockReward.rewardAmount.toString(),
          Number(api.consts.dappsStaking.blockPerEra.toString()),
        ]);
        const rewardsAmountPerEra = Number(ethers.utils.formatEther(rewardsAmount)) * blockPerEra;
        const numAdjToPercentage = 0.000000001;
        const dappsPercent = rewardsAllocation.dappsPercent.toNumber() * numAdjToPercentage;
        rewardsDeveloper.value = rewardsAmountPerEra * dappsPercent;
      } catch (error) {
        console.error(error);
      }
    };

    const sourceImg = (img: string, index: number) => {
      if (index === 0) {
        if (isShiden.value) {
          return require('/src/assets/img/ic_sdn_farm.svg');
        } else {
          return require('/src/assets/img/ic_astar_farm.svg');
        }
      } else if (index === 1) {
        return require('/src/assets/img/ic_algem_staking.svg');
      } else if (index === 2) {
        return require('/src/assets/img/ic_subwallet.svg');
      } else {
        return img;
      }
    };

    watchEffect(calcDeveloperRewards);

    return {
      nativeTokenSymbol,
      rewardsDeveloper,
      truncate,
      sourceImg,
      items,
      isShiden,
      goToLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/dynamic-ads-area.scss';
</style>
