<template>
  <router-view />
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
