<template>
  <div>
    <div
      v-if="dapps.length > 0 && progress > 0"
      class="tw-flex tw-flex-wrap tw-gap-x-12 xl:tw-gap-x-18 tw-justify-center"
    >
      <TVL />
      <DappsCount />
      <Requirement />
      <Era :progress="progress" :blocks-until-next-era="blocksUntilNextEra" :era="era" />
    </div>

    <div class="tw-text-center tw-mb-8">
      <Button @click="showRegisterDappModal = true">
        <icon-base
          class="tw-w-5 tw-h-5 tw-text-white tw--ml-1"
          stroke="currentColor"
          icon-name="plus"
        >
          <icon-plus />
        </icon-base>
        {{ $t('store.registerDapp') }}
      </Button>
    </div>

    <div class="store-container tw-grid tw-gap-x-12 xl:tw-gap-x-18 tw-justify-center">
      <div
        v-if="dapps.length === 0"
        class="tw-text-xl tx-font-semibold tw-mt-4 dark:tw-text-darkGray-100"
      >
        {{ $t('store.noDappsRegistered') }}
      </div>
      <Dapp
        v-for="(dapp, index) in dapps"
        :key="index"
        :dapp="dapp"
        @dappClick="showDetailsModal"
      />
    </div>

    <ModalRegisterDapp
      v-if="showRegisterDappModal"
      v-model:is-open="showRegisterDappModal"
      :show-close-button="false"
    />

    <ModalDappDetails
      v-if="showDappDetailsModal"
      v-model:is-open="showDappDetailsModal"
      :dapp="selectedDapp"
    />
  </div>
</template>

<script lang="ts">
import Button from 'components/common/Button.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconPlus from 'components/icons/IconPlus.vue';
import ModalDappDetails from 'components/store/modals/ModalDappDetails.vue';
import ModalRegisterDapp from 'components/store/modals/ModalRegisterDapp.vue';
import Dapp from 'src/components/store/Dapp.vue';
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { useCurrentEra } from 'src/hooks';
import { DappItem } from 'src/store/dapps-store/state';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import TVL from './statistics/TVL.vue';
import DappsCount from './statistics/DappsCount.vue';
import Requirement from './statistics/Requirement.vue';
import Era from './statistics/Era.vue';

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
    const { progress, blocksUntilNextEra, era } = useCurrentEra();

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
    };
  },
});
</script>

<style scoped>
.store-container {
  grid-template-columns: repeat(auto-fit, minmax(288px, max-content));
}
</style>
