<template>
  <div class="wrapper--dapp-staking">
    <div class="container--dapp-staking">
      <router-view />
    </div>
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
@use 'src/components/assets/styles/assets.scss';
.container--dapp-staking {
  display: grid;
  row-gap: 24px;
  max-width: 1300px;
  @media (max-width: $md) {
    display: block;
  }
}
</style>
