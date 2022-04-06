<template>
  <div>
    <div class="warning-text-container">
      {{
        $t('dappStaking.warning', {
          amount: minimumStakingAmount,
          stakers: maxNumberOfStakersPerContract.toLocaleString('en-US'),
        })
      }}
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

<style lang="scss" scoped>
.warning-text-container {
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
}
</style>
