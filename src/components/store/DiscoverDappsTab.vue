<template>
  <div>
    <Button class="tw-ml-4" @click="showRegisterDappModal = true">
      <icon-base
        class="tw-w-5 tw-h-5 tw-text-white tw--ml-1"
        stroke="currentColor"
        icon-name="plus"
      >
        <icon-plus />
      </icon-base>
      {{ $t('store.registerDapp') }}
    </Button>
    <div class="tw-flex tw-flex-row tw-flex-wrap tw-content-around">
      <DashboardItem :value="minimumStakingAmount" :caption="$t('store.minimumStakingAmount')" />
      <DashboardItem
        :value="maxNumberOfStakersPerContract"
        :caption="$t('store.maxNumberOfStakersPerContract')"
      />
    </div>
    <div class="tw-flex tw-flex-wrap tw-justify-start">
      <div
        v-if="dapps.length === 0"
        class="tw-text-xl tx-font-semibold tw-mt-4 tw-ml-4 dark:tw-text-darkGray-100"
      >
        {{ $t('store.noDappsRegistered') }}
      </div>
      <Dapp
        v-for="(dapp, index) in dapps"
        v-else
        :key="index"
        :dapp="dapp"
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
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import Dapp from 'src/components/store/Dapp.vue';
import IconPlus from 'components/icons/IconPlus.vue';
import IconBase from 'components/icons/IconBase.vue';
import ModalRegisterDapp from 'components/store/modals/ModalRegisterDapp.vue';
import ModalDappDetails from 'components/store/modals/ModalDappDetails.vue';
import Button from 'components/common/Button.vue';
import DashboardItem from 'components/common/DashboardItem.vue';
import { DappItem } from 'src/store/dapps-store/state';

export default defineComponent({
  components: {
    Dapp,
    IconPlus,
    IconBase,
    ModalRegisterDapp,
    ModalDappDetails,
    Button,
    DashboardItem,
  },
  setup() {
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);
    const maxNumberOfStakersPerContract = computed(
      () => store.getters['dapps/getMaxNumberOfStakersPerContract']
    );
    const minimumStakingAmount = computed(() => store.getters['dapps/getMinimumStakingAmount']);
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
    };
  },
});
</script>
