<template>
  <div>
    <div class="warning-wrapper">
      <div class="warning-text-container">
        {{
          $t('dappStaking.warning', {
            amount: minimumStakingAmount,
            stakers: maxNumberOfStakersPerContract.toLocaleString('en-US'),
          })
        }}
      </div>
      <Button :small="true" class="register-button" @click="showRegisterDappModal = true">
        + {{ $t('dappStaking.registerDapp') }}
      </Button>
    </div>
    <div v-if="isDapps" class="kpi-wrapper">
      <TVL />
      <DappsCount />
      <Era :progress="progress" :blocks-until-next-era="blocksUntilNextEra" :era="era" />
      <APR />
    </div>

    <UserRewards v-if="isDapps" />

    <div class="row--tab">
      <div
        class="tab"
        :class="[isNativeStaking ? 'selected-staking-option' : 'unselected-staking-option']"
        @click="isNativeStaking = true"
      >
        <span class="text--title">
          {{ $t('dappStaking.dappStakingNative') }}
        </span>
        <div v-if="isNativeStaking" class="tab--border"></div>
      </div>
      <div
        class="tab"
        :class="[!isNativeStaking ? 'selected-staking-option' : 'unselected-staking-option']"
        @click="isNativeStaking = false"
      >
        <span class="text--title">
          {{ $t('dappStaking.liquidStakingEVM') }}
        </span>
        <div v-if="!isNativeStaking" class="tab--border"></div>
      </div>
    </div>

    <template v-if="isNativeStaking">
      <div class="store-container tw-grid tw-gap-x-12 xl:tw-gap-x-18 tw-justify-center">
        <div v-if="!isDapps" class="tw-text-xl tx-font-semibold tw-mt-4 dark:tw-text-darkGray-100">
          {{ $t('dappStaking.noDappsRegistered') }}
        </div>
        <template v-if="stakeInfos">
          <Dapp
            v-for="(dapp, index) in dapps"
            :key="index"
            :dapp="dapp"
            :staker-max-number="maxNumberOfStakersPerContract"
            :account-data="accountData"
            :dapps="dapps"
            :staking-list="stakingList"
            :stake-infos="stakeInfos"
          />
        </template>
      </div>
    </template>

    <template v-else>
      <AlgemPanel />
    </template>

    <Teleport to="#app--main">
      <ModalRegisterDapp
        v-if="showRegisterDappModal"
        v-model:is-open="showRegisterDappModal"
        :show-close-button="false"
      />
      <ModalMaintenance :show="isPalletDisabled" />
    </Teleport>
  </div>
</template>

<script lang="ts">
import Button from 'components/common/Button.vue';
import ModalMaintenance from 'components/dapp-staking/modals/ModalMaintenance.vue';
import ModalRegisterDapp from 'components/dapp-staking/modals/ModalRegisterDapp.vue';
import { useMeta } from 'quasar';
import Dapp from 'src/components/dapp-staking/Dapp.vue';
import UserRewards from 'src/components/dapp-staking/UserRewards.vue';
import { useAccount, useBalance, useCurrentEra, useStakerInfo, useStakingList } from 'src/hooks';
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { DappItem } from 'src/store/dapp-staking/state';
import { computed, defineComponent, ref } from 'vue';
import APR from './statistics/APR.vue';
import DappsCount from './statistics/DappsCount.vue';
import Era from './statistics/Era.vue';
import TVL from './statistics/TVL.vue';
import AlgemPanel from './AlgemPanel.vue';

export default defineComponent({
  components: {
    Dapp,
    ModalRegisterDapp,
    Button,
    TVL,
    DappsCount,
    Era,
    UserRewards,
    APR,
    ModalMaintenance,
    AlgemPanel,
  },
  setup() {
    useMeta({ title: 'Discover dApps' });
    const store = useStore();
    const { progress, blocksUntilNextEra, era } = useCurrentEra();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { stakeInfos } = useStakerInfo();
    const { dapps, stakingList } = useStakingList();

    const maxNumberOfStakersPerContract = computed(
      () => store.getters['dapps/getMaxNumberOfStakersPerContract']
    );
    const minimumStakingAmount = computed(() => {
      const amount = store.getters['dapps/getMinimumStakingAmount'];
      return formatUnitAmount(amount);
    });

    const showRegisterDappModal = ref<boolean>(false);
    const selectedDapp = ref<DappItem>();
    const selectedDappInfo = ref<StakeInfo>();
    const isPalletDisabled = computed(() => store.getters['dapps/getIsPalletDisabled']);
    const isDapps = computed(() => dapps.value.length > 0);
    const isNativeStaking = ref<boolean>(true);

    return {
      isDapps,
      isNativeStaking,
      dapps,
      selectedDapp,
      selectedDappInfo,
      showRegisterDappModal,
      maxNumberOfStakersPerContract,
      minimumStakingAmount,
      progress,
      blocksUntilNextEra,
      era,
      accountData,
      currentAccount,
      isPalletDisabled,
      stakeInfos,
      stakingList,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.store-container {
  grid-template-columns: repeat(auto-fit, minmax(288px, max-content));
}

.warning-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 24px;
  @media (min-width: $sm) {
    margin-bottom: 0px;
  }
}

.warning-text-container {
  width: calc(100% - 150px);
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
}

.register-button {
  height: 32px;
  width: 150px;
}

.kpi-wrapper {
  display: flex;
  flex-wrap: wrap;
  column-gap: 66px;

  div {
    min-width: 288px;
    flex: 1;
  }
  @media (min-width: $xl) {
    justify-content: center;
    column-gap: 48px;
  }
}

.row--tab {
  display: flex;
  width: 100%;
  margin-bottom: 50px;
  gap: 32px;
  justify-content: center;

  .text--title {
    font-weight: 500;
  }
}

.tab {
  width: 208px;
  text-align: center;
  @media (max-width: $md) {
    width: 150px;
  }
}
.tab--border {
  width: 100%;
  height: 3px;
  margin-top: 8px;
  background: $astar-blue-dark;
  border-radius: 10px;
  transition: all 0.3s ease 0s;
}

.selected-staking-option {
  .text--title {
    font-weight: 700;
  }
}

.unselected-staking-option {
  cursor: pointer;
  border-bottom: 0px solid transparent;
  transition: all 0.3s ease 0s;
  &:hover {
    .text--title {
      font-weight: 700;
    }
  }
}
</style>
