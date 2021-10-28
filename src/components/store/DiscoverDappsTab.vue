<template>
  <div>
    <div class="tw-text-center lg:tw-text-left tw-mb-8">
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
    </div>

    <div
      class="
        tw-mb-8 tw-mx-20
        lg:tw-mx-4
        tw-flex tw-flex-row tw-content-around tw-justify-center
        lg:tw-justify-start
      "
    >
      <div
        class="
          tw-bg-blue-500
          dark:tw-bg-blue-800
          tw-text-white tw-overflow-hidden tw-shadow tw-rounded-lg
        "
      >
        <div
          class="
            tw-rounded-lg
            md:tw-pb-0
            tw-h-full tw-bg-local tw-bg-left-top tw-bg-no-repeat tw-bg-80
            md:tw-bg-88
            tw-px-4
          "
        >
          <p class="tw-font-semibold tw-text-center tw-py-4">
            <span class="tw-text-lg tw-tracking-tight tw-leading-tight">
              {{
                $t('store.warning', {
                  amount: minimumStakingAmount,
                  staker: maxNumberOfStakersPerContract,
                })
              }}
            </span>
          </p>
        </div>
      </div>
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
import { DappItem } from 'src/store/dapps-store/state';
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';

export default defineComponent({
  components: {
    Dapp,
    IconPlus,
    IconBase,
    ModalRegisterDapp,
    ModalDappDetails,
    Button,
  },
  setup() {
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);
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
    };
  },
});
</script>

<style scoped>
.store-container {
  grid-template-columns: repeat(auto-fit, minmax(288px, max-content));
}
</style>
