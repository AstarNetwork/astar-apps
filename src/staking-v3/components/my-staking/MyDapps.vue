<template>
  <div class="table--wrapper">
    <div class="row--header">
      <div class="column column--dapp">{{ $t('stakingV3.dApp') }}</div>
      <div class="column column--amount">{{ $t('stakingV3.stakedAmount') }}</div>
      <div class="column column--bonus">{{ $t('stakingV3.bonusRewards') }}</div>
      <div v-if="width >= screenSize.sm" class="column column--manage">
        {{ $t('stakingV3.manage') }}
      </div>
    </div>
    <div v-for="[key, value] in stakedDapps" :key="key">
      <my-dapp
        v-if="getStakedAmountInVoting(value) > BigInt(0)"
        :name="getDappName(key)"
        :address="key"
        :amount="getStakedAmountInVoting(value)"
        :loyal-staker="value.loyalStaker"
        :actions-enabled="isRegistered(key)"
        :navigate-to-move="navigateToMove"
        :navigate-to-vote="navigateToVote"
        :handle-unbonding="handleUnbonding"
      />
      <my-dapp
        v-if="getStakedAmountInBuild(value) > BigInt(0)"
        :name="getDappName(key)"
        :address="key"
        :amount="getStakedAmountInBuild(value)"
        :loyal-staker="false"
        :actions-enabled="isRegistered(key)"
        :navigate-to-move="navigateToMove"
        :navigate-to-vote="navigateToVote"
        :handle-unbonding="handleUnbonding"
      />
      <div v-if="!isRegistered(key)" class="warning--unregistered-dapp">
        <astar-icon-warning size="20" />
        <span class="text--unregistered-dapp">
          {{ $t('stakingV3.unregisteredDappInfo', { days: constants?.unlockingPeriod ?? '--' }) }}
        </span>
        <astar-button
          class="btn--unregistered-dapp"
          @click="unstakeFromUnregistered(key, getDappName(key))"
        >
          {{ $t('stakingV3.claim') }}
        </astar-button>
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
import ModalUnbondDapp from './ModalUnbondDapp.vue';
import MyDapp from './MyDapp.vue';
import { useBreakpoints } from 'src/hooks';

export default defineComponent({
  components: {
    ModalUnbondDapp,
    MyDapp,
  },
  props: {
    stakedDapps: {
      type: Object as PropType<Map<string, SingularStakingInfo>>,
      required: true,
    },
  },
  setup() {
    const { getDapp } = useDapps();
    const { navigateToVote, navigateToMove } = useDappStakingNavigation();
    const { unstake, unstakeFromUnregistered, constants } = useDappStaking();

    const dappToUnbond = ref<CombinedDappInfo | undefined>();
    const showModalUnbond = ref<boolean>(false);
    const setShowModalUnbond = (isOpen: boolean): void => {
      showModalUnbond.value = isOpen;
    };

    const getDappName = (dappAddress: string): string => {
      return getDapp(dappAddress)?.basic.name ?? '';
    };

    const getStakedAmount = (stakingInfo: SingularStakingInfo): bigint => {
      return stakingInfo.staked.totalStake;
    };

    const getStakedAmountInVoting = (stakingInfo: SingularStakingInfo): bigint => {
      return stakingInfo.staked.voting;
    };

    const getStakedAmountInBuild = (stakingInfo: SingularStakingInfo): bigint => {
      return stakingInfo.staked.buildAndEarn;
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
      constants,
      setShowModalUnbond,
      getDappName,
      getStakedAmount,
      navigateToVote,
      navigateToMove,
      unstake,
      handleUnbonding,
      isRegistered,
      unstakeFromUnregistered,
      getStakedAmountInBuild,
      getStakedAmountInVoting,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/staking-table.scss';

.warning--unregistered-dapp {
  border-radius: 6px;
  border: 1px solid $border-yellow;
  background: rgba(240, 185, 11, 0.1);
  display: flex;
  padding: 8px 16px;
  gap: 8px;
  align-items: flex-start;
  align-items: center;
  font-size: 12px;
  @media (min-width: $sm) {
    font-size: 14px;
  }
  .text--unregistered-dapp {
    flex: 1;
  }
  .btn--unregistered-dapp {
    width: 64px;
    padding: 4px;
  }
}
</style>
