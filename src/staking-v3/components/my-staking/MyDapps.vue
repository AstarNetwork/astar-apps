<template>
  <div class="table--wrapper">
    <div class="chunk--row header--row">
      <div>{{ $t('stakingV3.dApp') }}</div>
      <div>{{ $t('stakingV3.stakedAmount') }}</div>
      <div>{{ $t('stakingV3.bonusReward') }}</div>
      <div v-if="width >= screenSize.sm" class="center">{{ $t('stakingV3.manage') }}</div>
    </div>
    <div v-for="[key, value] in stakedDapps" :key="key">
      <div class="chunk--row">
        <div>{{ getDappName(key) }}</div>
        <div class="right">
          <token-balance-native :balance="getStakedAmount(value).toString()" />
        </div>
        <div class="right">{{ value.loyalStaker ? 'Yes' : 'No' }}</div>
        <div v-if="isRegistered(key)" class="buttons">
          <astar-button :width="97" :height="24" @click="navigateToVote(key)">{{
            $t('stakingV3.add')
          }}</astar-button>
          <astar-button :width="97" :height="24" @click="handleUnbonding(key)">{{
            $t('stakingV3.unbond')
          }}</astar-button>
        </div>
        <div v-else class="button--single">
          <astar-button
            :width="97"
            :height="24"
            @click="unstakeFromUnregistered(key, getDappName(key))"
            >{{ $t('stakingV3.unbond') }}</astar-button
          >
        </div>
      </div>
      <div v-if="!isRegistered(key)" class="unregistered--dapp">
        <astar-icon-warning size="20" />{{ $t('stakingV3.unregisteredDappInfo') }}
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
import { CombinedDappInfo, DappState, SingularStakingInfo } from 'src/staking-v3/logic';
import { defineComponent, PropType, ref } from 'vue';
import { useDapps, useDappStakingNavigation, useDappStaking } from 'src/staking-v3/hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import ModalUnbondDapp from './ModalUnbondDapp.vue';
import { useBreakpoints } from 'src/hooks';

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
    const { unstake, unstakeFromUnregistered } = useDappStaking();

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

    const isRegistered = (dappAddress: string): boolean => {
      return getDapp(dappAddress)?.chain.state === DappState.Registered ?? false;
    };

    const handleUnbonding = (dappAddress: string): void => {
      dappToUnbond.value = getDapp(dappAddress);
      showModalUnbond.value = true;
    };

    const { width, screenSize } = useBreakpoints();

    return {
      showModalUnbond,
      dappToUnbond,
      width,
      screenSize,
      setShowModalUnbond,
      getDappName,
      getStakedAmount,
      navigateToVote,
      unstake,
      handleUnbonding,
      isRegistered,
      unstakeFromUnregistered,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.table--wrapper {
  background-color: $gray-1;
  padding: 20px 12px;
  border-radius: 16px;
  @media (min-width: $sm) {
    padding: 40px 24px;
  }
}

.chunk--row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  border-bottom: solid 1px $gray-2;
  @media (min-width: $sm) {
    flex-wrap: nowrap;
  }
  div {
    flex-basis: 0;
    flex-grow: 1;
    padding: 16px;
  }
}

.header--row {
  background: rgba(0, 0, 0, 0.03);
  color: $gray-4;
  border: 0;
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
  width: 100%;
  @media (min-width: $sm) {
    width: auto;
  }
}

.body--dark {
  .table--wrapper {
    background-color: $navy-3;
  }
  .header--row {
    color: $gray-2;
    background: rgba(0, 0, 0, 0.15);
  }
  .chunk--row {
    border-color: lighten($navy-3, 10%);
  }
}
</style>
