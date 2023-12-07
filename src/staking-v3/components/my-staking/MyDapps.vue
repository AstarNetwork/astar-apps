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
      <div class="buttons">
        <astar-button :width="97" :height="24" @click="navigateToVote(key)">{{
          $t('stakingV3.add')
        }}</astar-button>
        <astar-button :width="97" :height="24" @click="handleUnbonding(key)">{{
          $t('stakingV3.unbond')
        }}</astar-button>
      </div>
    </div>
    <modal-unbond-dapp
      v-if="dappToUnbond"
      :set-is-open="setShowModalUnbond"
      :show="showModalUnbond"
      :dapp="dappToUnbond"
    />
  </div>
</template>

<script lang="ts">
import { CombinedDappInfo, SingularStakingInfo } from 'src/staking-v3/logic';
import { defineComponent, PropType, ref } from 'vue';
import { useDapps, useDappStakingNavigation, useDappStaking } from 'src/staking-v3/hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import ModalUnbondDapp from './ModalUnbondDapp.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
    ModalUnbondDapp,
  },
  props: {
    stakedDapps: {
      type: Object as PropType<Map<string, SingularStakingInfo>>,
      required: true,
    },
  },
  setup() {
    const { registeredDapps, getDapp } = useDapps();
    const { navigateToVote } = useDappStakingNavigation();
    const { unstake } = useDappStaking();

    const dappToUnbond = ref<CombinedDappInfo | undefined>();
    const showModalUnbond = ref<boolean>(false);
    const setShowModalUnbond = (isOpen: boolean): void => {
      showModalUnbond.value = isOpen;
    };

    const getDappName = (dappAddress: string): string => {
      return getDapp(dappAddress)?.basic.name ?? '';
    };

    const getStakedAmount = (stakingInfo: SingularStakingInfo): bigint => {
      return stakingInfo.staked.voting + stakingInfo.staked.buildAndEarn;
    };

    const handleUnbonding = (dappAddress: string): void => {
      dappToUnbond.value = getDapp(dappAddress);
      showModalUnbond.value = true;
    };

    return {
      showModalUnbond,
      dappToUnbond,
      setShowModalUnbond,
      getDappName,
      getStakedAmount,
      navigateToVote,
      unstake,
      handleUnbonding,
    };
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

.buttons {
  display: flex;
  justify-content: center;
  column-gap: 16px;
}
</style>
