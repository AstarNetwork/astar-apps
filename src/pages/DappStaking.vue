<template>
  <div>
    <div
      class="
        sm:tw-flex
        tw-items-end tw-border-b tw-border-gray-300
        dark:tw-border-darkGray-600
        tw-mb-8
        tw-mx--4
        sm:tw--mx-8
        tw-px-4
        sm:tw-px-8
      "
    >
      <h1
        class="
          md:tw-mr-10
          tw-text-3xl tw-font-extrabold tw-text-blue-900
          dark:tw-text-white
          tw-mb-6
          sm:tw-mb-8
          tw-whitespace-nowrap
        "
      >
        {{ $t('dappStaking.dappStaking') }}
      </h1>
      <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
        <div class="tw-flex">
          <Tab :labels="[{ label: 'Discover', path: 'discover' }]" />
          <!-- <Tab :labels="[{ label: 'Manage', path: 'manage-dapps' }]" /> -->
        </div>
        <div
          class="
            tw-hidden
            lg:tw-block
            tw-ml-4
            2xl:tw-text-lg
            tw-font-semibold tw-text-blue-900
            dark:tw-text-white
          "
        >
          {{
            $t('dappStaking.warning', {
              amount: minimumStakingAmount,
              stakers: maxNumberOfStakersPerContract.toLocaleString('en-US'),
            })
          }}
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import Tab from 'components/common/Tab.vue';
export default defineComponent({
  components: { Tab },
  setup() {
    const store = useStore();
    const maxNumberOfStakersPerContract = computed(
      () => store.getters['dapps/getMaxNumberOfStakersPerContract']
    );
    const minimumStakingAmount = computed(() => {
      const amount = store.getters['dapps/getMinimumStakingAmount'];
      return formatUnitAmount(amount);
    });

    return {
      maxNumberOfStakersPerContract,
      minimumStakingAmount,
    };
  },
});
</script>
