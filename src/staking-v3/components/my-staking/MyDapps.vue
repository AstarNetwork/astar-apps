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
      <div class="row">
        <div class="column column--dapp">{{ getDappName(key) }}</div>
        <div class="column column--amount">
          <token-balance-native :balance="getStakedAmount(value).toString()" />
        </div>
        <div class="column column--bonus">
          <span v-if="value.loyalStaker" class="icon--check">
            <astar-icon-check />
          </span>
          <span v-else>-</span>
        </div>
        <div class="column column--actions">
          <div>
            <button
              type="button"
              class="btn btn--icon icon--move"
              :disabled="!isRegistered(key)"
              @click="navigateToMove(key)"
            >
              <astar-icon-arrow-up-right />
            </button>
            <span class="text--mobile-menu">
              {{ $t('stakingV3.move') }}
            </span>
            <q-tooltip>
              <span class="text--tooltip">
                {{ $t('stakingV3.move') }}
              </span>
            </q-tooltip>
          </div>

          <div>
            <button
              type="button"
              class="btn btn--icon icon--unlock"
              :disabled="!isRegistered(key)"
              @click="handleUnbonding(key)"
            >
              <astar-icon-arrow-up-right />
            </button>
            <span class="text--mobile-menu">
              {{ $t('stakingV3.unlock') }}
            </span>
            <q-tooltip>
              <span class="text--tooltip">
                {{ $t('stakingV3.unlock') }}
              </span>
            </q-tooltip>
          </div>

          <div>
            <button
              type="button"
              class="btn btn--icon icon--add"
              :disabled="!isRegistered(key)"
              @click="navigateToVote(key)"
            >
              <astar-icon-arrow-up-right />
            </button>
            <span class="text--mobile-menu">
              {{ $t('stakingV3.add') }}
            </span>
            <q-tooltip>
              <span class="text--tooltip">
                {{ $t('stakingV3.add') }}
              </span>
            </q-tooltip>
          </div>
        </div>
      </div>
      <div v-if="!isRegistered(key)" class="warning--unregistered-dapp">
        <astar-icon-warning size="20" />
        <span class="text--unregistered-dapp">
          {{ $t('stakingV3.unregisteredDappInfo') }}
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
    const { getDapp } = useDapps();
    const { navigateToVote, navigateToMove } = useDappStakingNavigation();
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
      return stakingInfo.staked.totalStake;
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
      navigateToMove,
      unstake,
      handleUnbonding,
      isRegistered,
      unstakeFromUnregistered,
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
