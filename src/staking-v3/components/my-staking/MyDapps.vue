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
            <!-- TODO: move to AstarUI -->
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.54988 15.5154L18.1884 6.87692C18.3371 6.72821 18.5137 6.65224 18.7182 6.64902C18.9226 6.64582 19.1024 6.72179 19.2576 6.87692C19.4127 7.03204 19.4903 7.21024 19.4903 7.41152C19.4903 7.61279 19.4127 7.79099 19.2576 7.94612L10.1826 17.0211C10.0018 17.2019 9.7909 17.2922 9.54988 17.2922C9.30887 17.2922 9.09798 17.2019 8.91721 17.0211L4.74221 12.8461C4.59349 12.6974 4.52009 12.5208 4.52201 12.3163C4.52394 12.1118 4.60247 11.932 4.75758 11.7769C4.91272 11.6218 5.09092 11.5442 5.29218 11.5442C5.49347 11.5442 5.67167 11.6218 5.82678 11.7769L9.54988 15.5154Z"
                fill="currentColor"
              />
            </svg>
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
              class="btn btn--icon icon--unbond"
              :disabled="!isRegistered(key)"
              @click="handleUnbonding(key)"
            >
              <astar-icon-arrow-up-right />
            </button>
            <span class="text--mobile-menu">
              {{ $t('stakingV3.unbond') }}
            </span>
            <q-tooltip>
              <span class="text--tooltip">
                {{ $t('stakingV3.unbond') }}
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
