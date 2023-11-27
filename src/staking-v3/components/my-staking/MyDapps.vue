<template>
  <div>
    <div class="dapp--row">
      <div>{{ $t('stakingV3.dApp') }}</div>
      <div>{{ $t('stakingV3.stakedAmount') }}</div>
      <div>{{ $t('stakingV3.bonusReward') }}</div>
      <div class="center">{{ $t('stakingV3.manage') }}</div>
    </div>
    <div v-for="[key, value] in stakedDapps" :key="key" class="dapp--row">
      <div>{{ getDappName(key) }}</div>
      <div class="right"><token-balance-native :balance="getStakedAmount(value).toString()" /></div>
      <div class="right">{{ value.loyalStaker ? 'Yes' : 'No' }}</div>
      <div></div>
    </div>
  </div>
</template>

<script lang="ts">
import { SingularStakingInfo } from 'src/staking-v3/logic';
import { defineComponent, PropType } from 'vue';
import { useDapps } from 'src/staking-v3/hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  props: {
    stakedDapps: {
      type: Object as PropType<Map<string, SingularStakingInfo>>,
      required: true,
    },
  },
  setup() {
    const { registeredDapps } = useDapps();

    const getDappName = (dappAddress: string): string => {
      const dapp = registeredDapps.value.find((dapp) => dapp.basic.address === dappAddress);
      return dapp?.basic.name ?? '';
    };

    const getStakedAmount = (stakingInfo: SingularStakingInfo): bigint => {
      return stakingInfo.staked.voting + stakingInfo.staked.buildAndEarn;
    };

    return { getDappName, getStakedAmount };
  },
});
</script>

<style lang="scss" scoped>
.header--row {
  display: flex;
  justify-content: space-between;
}

.dapp--row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  line-height: normal;

  div {
    flex-basis: 0;
    flex-grow: 1;
    padding: 16px;
  }
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}
</style>
