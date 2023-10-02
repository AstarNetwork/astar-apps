<template>
  <div class="card">
    <div class="txt--subtitle">
      <span>
        {{ $t('dappStaking.developerIncentive') }}
      </span>
    </div>
    <div class="row--values">
      <span class="txt--value">
        {{ $n(truncate(rewardsDeveloper, 0)) }}
      </span>
      <span class="txt--value txt--flag">{{
        $t('dappStaking.tokenEra', { token: nativeTokenSymbol })
      }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Struct } from '@polkadot/types';
import { Perbill } from '@polkadot/types/interfaces';
import { ethers } from 'ethers';
import { $api } from 'src/boot/api';
import { useNetworkInfo } from 'src/hooks';
import { truncate } from '@astar-network/astar-sdk-core';
import { defineComponent, ref, watchEffect } from 'vue';

interface RewardDistributionConfig extends Struct {
  readonly baseTreasuryPercent: Perbill;
  readonly baseStakerPercent: Perbill;
  readonly dappsPercent: Perbill;
  readonly collatorsPercent: Perbill;
  readonly adjustablePercent: Perbill;
  readonly idealDappsStakingTvl: Perbill;
}

export default defineComponent({
  setup() {
    const rewardsDeveloper = ref<number>(0);
    const { nativeTokenSymbol } = useNetworkInfo();

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

    watchEffect(calcDeveloperRewards);
    return {
      rewardsDeveloper,
      nativeTokenSymbol,
      truncate,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.card {
  display: flex;
  background-size: cover;
  flex-direction: column;
  justify-content: center;
  flex-basis: 50%;
  background: #d9d9d9;
  min-height: 127px;
  border-radius: 5px;
  padding: 24px;
  background-image: url('src/assets/img/banner/banner-01-light.png');
  margin-bottom: 20px;
  @media (min-width: $sm) {
    margin-bottom: 0;
  }

  .txt--subtitle {
    font-weight: 800;
    font-size: 16px;
    line-height: 26px;
    color: $gray-4;
  }

  .row--values {
    display: flex;
    column-gap: 10px;
    align-items: center;
  }

  .txt--value {
    font-style: normal;
    font-weight: 800;
    font-size: 32px;
    background: linear-gradient(
      100.62deg,
      #e6007a -13.87%,
      #703ac2 10.44%,
      #0070eb 47.07%,
      #0297fb 89.31%,
      #0ae2ff 151.16%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  .txt--flag {
    font-size: 18px;
    line-height: 22px;
  }
}

.body--dark {
  .card {
    background-image: url('src/assets/img/banner/banner-01-dark.png');
  }
}
</style>
