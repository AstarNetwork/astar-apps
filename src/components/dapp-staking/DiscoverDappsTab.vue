<template>
  <div>
    <div
      v-if="dapps.length > 0"
      class="tw-flex tw-flex-wrap tw-gap-x-12 xl:tw-gap-x-18 tw-justify-center"
    >
      <TVL />
      <DappsCount />
      <Requirement />
      <Era :progress="progress" :blocks-until-next-era="blocksUntilNextEra" :era="era" />
      <APR />
      <UserRewards />
    </div>
    <div class="tw-text-center tw-mb-8 tw-flex tw-items-center tw-justify-center sm:tw-gap-x-4">
      <Button @click="showRegisterDappModal = true">
        <icon-base
          class="tw-w-5 tw-h-5 tw-text-white tw--ml-1"
          stroke="currentColor"
          icon-name="plus"
        >
          <icon-plus />
        </icon-base>
        {{ $t('dappStaking.registerDapp') }}
      </Button>
    </div>
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

    <ModalRegisterDapp
      v-if="showRegisterDappModal"
      v-model:is-open="showRegisterDappModal"
      :show-close-button="false"
    />
  </div>
</template>

<script lang="ts">
import Button from 'components/common/Button.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconPlus from 'components/icons/IconPlus.vue';
import ModalRegisterDapp from 'components/dapp-staking/modals/ModalRegisterDapp.vue';
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
import Requirement from './statistics/Requirement.vue';
import Era from './statistics/Era.vue';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { fasSeedling } from '@quasar/extras/fontawesome-v5';
import { useMeta } from 'quasar';

export default defineComponent({
  components: {
    Dapp,
    IconPlus,
    IconBase,
    ModalRegisterDapp,
    Button,
    TVL,
    DappsCount,
    Requirement,
    Era,
    UserRewards,
    APR,
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
    };
  },
});
</script>

<style scoped>
@import 'src/css/quasar.variables.scss';

.store-container {
  grid-template-columns: repeat(auto-fit, minmax(288px, max-content));
}

.user-rewards-wrapper {
  margin: 0px 326px;

  @media (max-width: $xxl) {
    margin: 0px 00px;
  }
}
</style>
