<template>
  <div v-if="ownDapps.length > 0" class="container">
    <div class="wrapper--your-project">
      <div class="row--title">
        <astar-icon-project />
        <span class="text--title">{{ $t('assets.yourProject') }}</span>
      </div>
      <div class="separator" />
      <div class="box--dapps">
        <router-link
          v-for="dapp in ownDapps"
          :key="dapp.chain.address"
          :to="navigateOwnerPage(dapp.chain.address)"
          class="card--dapp"
        >
          <img class="icon--dapp-logo" :src="dapp.basic.iconUrl" :alt="dapp.basic.name" />
          <div class="row--dapp-name">
            <span> {{ dapp.basic.name }} </span>
            <div v-if="checkIsRewards(dapp.chain.address)" class="column--rewards">
              <span>{{ $t('assets.rewardsAvailable') }}</span>
            </div>
          </div>
          <div v-if="checkIsRewards(dapp.chain.address)">
            <div class="dot--bg" />
            <div class="dot--active" />
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useClaimAll } from 'src/hooks';
import { CombinedDappInfo, IDappStakingService, useDappStaking, useDappStakingNavigation } from 'src/staking-v3';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { defineComponent, watch, ref } from 'vue';

export default defineComponent({
  props: {
    ownDapps: {
      type: Array<CombinedDappInfo>,
      required: true,
    },
  },
  setup(props) {
    useClaimAll();
    const { navigateOwnerPage } = useDappStakingNavigation();
    const { rewards, getDappRewards } = useDappStaking();
    const dAppRewardsMap = ref<{ dapp: string, rewards: bigint }[]>([]);

    const checkIsRewards = (address: string): boolean => {
      const dapp = dAppRewardsMap.value.find((it) => it.dapp === address);
      if (dapp) {
        return dapp.rewards > 0;
      }
      return false;
    }

    const setDappRewardsMap = async (): Promise<void> => {
      const dAppRewardsArray: { dapp: string, rewards: bigint }[] = [];
      if (props.ownDapps.length === 0) return


      for await (const dapp of props.ownDapps) {
        const ownedContractAddress = dapp.chain.address;
        const dAppRewards = await getDappRewards(ownedContractAddress);
        if (dAppRewards > 0) {
          dAppRewardsArray.push({ dapp: ownedContractAddress, rewards: dAppRewards });
        }
      }
      dAppRewardsMap.value = dAppRewardsArray;
    }

    watch([rewards], setDappRewardsMap, { immediate: false });

    return { navigateOwnerPage, checkIsRewards };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/your-project.scss';
</style>
