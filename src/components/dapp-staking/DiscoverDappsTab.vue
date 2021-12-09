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
      <div
        v-if="stakerApy > 0"
        class="
          sm:tw-w-40
          tw-justify-center
          tw-inline-flex
          tw-items-center
          tw-px-6
          tw-py-3
          tw-border
          tw-border-transparent
          tw-text-sm
          tw-font-medium
          tw-rounded-full
          tw-shadow-sm
          tw-text-white
          tw-bg-indigo-500
          tw-mx-1
        "
      >
        <icon-base class="tw-w-5 tw-h-5 tw-text-white tw--ml-2 tw-mr-2" icon-name="seedling">
          <q-icon :name="fasSeedling" color="green" />
        </icon-base>
        <div>
          {{ $t('dappStaking.stakerApy', { value: Number(stakerApy.toFixed(1)) }) }}
        </div>
      </div>
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
        @dappClick="showDetailsModal"
      />
    </div>

    <ModalRegisterDapp v-if="showRegisterDappModal" v-model:isOpen="showRegisterDappModal" />

    <ModalDappDetails
      v-if="showDappDetailsModal"
      v-model:isOpen="showDappDetailsModal"
      :dapp="selectedDapp"
    />
  </div>
</template>

<script lang="ts">
import Button from 'components/common/Button.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconPlus from 'components/icons/IconPlus.vue';
import ModalDappDetails from 'components/dapp-staking/modals/ModalDappDetails.vue';
import ModalRegisterDapp from 'components/dapp-staking/modals/ModalRegisterDapp.vue';
import Dapp from 'src/components/dapp-staking/Dapp.vue';
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { useCurrentEra, useApr, useApi, useAccount, useBalance } from 'src/hooks';
import { DappItem } from 'src/store/dapp-staking/state';
import { computed, defineComponent, ref } from 'vue';
import TVL from './statistics/TVL.vue';
import DappsCount from './statistics/DappsCount.vue';
import Requirement from './statistics/Requirement.vue';
import Era from './statistics/Era.vue';
import { fasSeedling } from '@quasar/extras/fontawesome-v5';
import { useMeta } from 'quasar';

export default defineComponent({
  components: {
    Dapp,
    IconPlus,
    IconBase,
    ModalRegisterDapp,
    ModalDappDetails,
    Button,
    TVL,
    DappsCount,
    Requirement,
    Era,
  },
  setup() {
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);
    useMeta({ title: 'Discover dApps' });
    const { stakerApy } = useApr();
    const { progress, blocksUntilNextEra, era } = useCurrentEra();
    const { api } = useApi();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(api, currentAccount);

    const maxNumberOfStakersPerContract = computed(
      () => store.getters['dapps/getMaxNumberOfStakersPerContract']
    );
    const minimumStakingAmount = computed(() => {
      const amount = store.getters['dapps/getMinimumStakingAmount'];
      return formatUnitAmount(amount);
    });
    const showRegisterDappModal = ref<boolean>(false);
    const showDappDetailsModal = ref<boolean>(false);
    const selectedDapp = ref<DappItem>();

    store.dispatch('dapps/getDapps');
    store.dispatch('dapps/getStakingInfo');

    const showDetailsModal = (dapp: DappItem): void => {
      selectedDapp.value = dapp;
      showDappDetailsModal.value = true;
    };

    return {
      dapps,
      selectedDapp,
      showRegisterDappModal,
      showDappDetailsModal,
      maxNumberOfStakersPerContract,
      minimumStakingAmount,
      showDetailsModal,
      progress,
      blocksUntilNextEra,
      era,
      stakerApy,
      fasSeedling,
      accountData,
    };
  },
});
</script>

<style scoped>
.store-container {
  grid-template-columns: repeat(auto-fit, minmax(288px, max-content));
}
</style>
