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
      <Button
        v-if="false"
        :small="true"
        class="register-button"
        @click="showRegisterDappModal = true"
      >
        + {{ $t('dappStaking.registerDapp') }}
      </Button>
      <div
        class="
          tw-bg-white
          dark:tw-bg-darkGray-800
          tw-shadow tw-rounded-lg tw-text-blue-900
          dark:tw-text-darkGray-100
          tw-p-2 tw-w-48
        "
      >
        Dapp registration is temporarily unavailable.
      </div>
    </div>
    <div v-if="isDapps" class="kpi-wrapper">
      <TVL />
      <DappsCount />
      <Era :progress="progress" :blocks-until-next-era="blocksUntilNextEra" :era="era" />
      <APR />
    </div>

    <UserRewards v-if="isDapps" />

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
import { computed, defineComponent, ref, watchEffect } from 'vue';
import APR from './statistics/APR.vue';
import DappsCount from './statistics/DappsCount.vue';
import Era from './statistics/Era.vue';
import TVL from './statistics/TVL.vue';

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

    return {
      isDapps,
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
</style>
