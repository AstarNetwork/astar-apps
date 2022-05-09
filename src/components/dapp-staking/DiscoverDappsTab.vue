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
    <div v-if="dapps.length > 0" class="kpi-wrapper">
      <TVL />
      <DappsCount />
      <Era :progress="progress" :blocks-until-next-era="blocksUntilNextEra" :era="era" />
      <APR />
    </div>
    <UserRewards />
    <div class="store-container tw-grid tw-gap-x-12 xl:tw-gap-x-18 tw-justify-center">
      <div
        v-if="dapps.length === 0"
        class="tw-text-xl tx-font-semibold tw-mt-4 dark:tw-text-darkGray-100"
      >
        {{ $t('dappStaking.noDappsRegistered') }}
      </div>
      <Dapp
        v-for="(dapp, index) in dapps"
        :key="index"
        :dapp="dapp"
        :staker-max-number="maxNumberOfStakersPerContract"
        :account-data="accountData"
      />
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
import ModalRegisterDapp from 'components/dapp-staking/modals/ModalRegisterDapp.vue';
import ModalMaintenance from 'components/dapp-staking/modals/ModalMaintenance.vue';
import Dapp from 'src/components/dapp-staking/Dapp.vue';
import UserRewards from 'src/components/dapp-staking/UserRewards.vue';
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { useCurrentEra, useAccount, useBalance } from 'src/hooks';
import { DappItem } from 'src/store/dapp-staking/state';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import TVL from './statistics/TVL.vue';
import DappsCount from './statistics/DappsCount.vue';
import APR from './statistics/APR.vue';
import Era from './statistics/Era.vue';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { fasSeedling } from '@quasar/extras/fontawesome-v5';
import { useMeta } from 'quasar';

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
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);
    useMeta({ title: 'Discover dApps' });
    const { progress, blocksUntilNextEra, era } = useCurrentEra();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

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

    store.dispatch('dapps/getDapps');
    store.dispatch('dapps/getStakingInfo');

    watchEffect(() => {
      if (isH160.value) {
        store.dispatch('general/showAlertMsg', {
          msg: 'dApp staking only supports Substrate wallets',
          alertType: 'error',
        });
      }
    });

    return {
      dapps,
      selectedDapp,
      selectedDappInfo,
      showRegisterDappModal,
      maxNumberOfStakersPerContract,
      minimumStakingAmount,
      progress,
      blocksUntilNextEra,
      era,
      fasSeedling,
      accountData,
      currentAccount,
      isPalletDisabled,
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
