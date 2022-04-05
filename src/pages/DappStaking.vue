<template>
  <div>
    <div class="sm:tw-flex tw-items-end tw-mb-8 tw-mx--4 sm:tw--mx-8 tw-px-4 sm:tw-px-8">
      <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
        <div class="tw-flex"></div>
        <div
          class="
            tw-hidden
            lg:tw-block lg:tw-mb-2
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
export default defineComponent({
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
