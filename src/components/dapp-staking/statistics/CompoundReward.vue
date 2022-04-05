<template>
  <div
    v-if="isSupported"
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-shadow tw-mb-8 tw-w-72 tw-rounded-lg tw-text-white
      dark:tw-text-darkGray-100
      tw-py-4 tw-pb-8 tw-px-4
      box
      xl:tw-mx-2
    "
  >
    <div class="tw-text-xl tw-font-semibold tw-mb-4">Compounding rewards</div>
    <div class="tw-flex tw-flex-col tw-items-center">
      {{ rewardDestination }}
      <button @click="changeDestination">Change destination</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useCompoundRewards, RewardDestination } from 'src/hooks/dapps-staking/useCompoundRewards';

export default defineComponent({
  setup() {
    const { isSupported, rewardDestination, setRewardDestination } = useCompoundRewards();
    // const autoCompound = ref<boolean>(false);

    // watch([rewardDestination], () => {
    //   autoCompound.value = rewardDestination.value === RewardDestination.StakeBalance;
    // });

    const changeDestination = async () => {
      // const newDestination =
      //   <RewardDestination>rewardDestination.value === RewardDestination.FreeBalance
      //     ? RewardDestination.StakeBalance
      //     : RewardDestination.FreeBalance;
      // console.log(newDestination, rewardDestination.value);
      await setRewardDestination(RewardDestination.StakeBalance);
    };

    return {
      isSupported,
      rewardDestination,
      //autoCompound,
      changeDestination,
    };
  },
});
</script>

<style scoped>
.box {
  background: linear-gradient(83.83deg, #694ea4, #1b6dc1 37.5%, #1b6dc1 65.1%, #2ea0c4);
  box-shadow: 0 2px 2px rgb(0 0 0 / 30%);
}
</style>
