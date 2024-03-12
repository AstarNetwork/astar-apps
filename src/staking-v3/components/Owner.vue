<template>
  <div>
    <div v-if="dappAddress && dapp" class="wrapper--owner">
      <div class="container--owner-header">
        <div class="container--owner-header__inner">
          <div class="row--your-dashboard">
            <span>{{ $t('stakingV3.yourDashboard') }}</span>
          </div>
          <div class="row--dapp-hero">
            <img :src="dapp.basic.iconUrl" alt="icon" class="img--dapp-icon" />
            <span class="text--dapp-name">{{ dapp.basic.name }}</span> ({{ dapp.chain.state }})
          </div>
        </div>
      </div>

      <div
        class="container--owner-main"
        :style="{ backgroundImage: `url(${require('src/staking-v3/assets/grid_bg.svg')})` }"
      >
        <div class="container--owner-main__inner">
          <your-rewards
            :total-rewards="totalRewards"
            :rewards-per-period="rewardsPerPeriod"
            :claim-rewards="claimRewards"
          />
          <edit />
        </div>
      </div>
    </div>
    <div class="bg--owner" />
    <dapp-icon-background :dapp="dapp" />
  </div>
</template>

<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { computed, defineComponent, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDapps, useDappStakingNavigation, useDappStaking, RewardsPerPeriod } from '../hooks';
import { CombinedDappInfo } from '../logic';
import Edit from './Edit.vue';
import YourRewards from './YourRewards.vue';
import DappIconBackground from './dapp/DappIconBackground.vue';

export default defineComponent({
  components: { YourRewards, Edit, DappIconBackground },
  setup() {
    const route = useRoute();
    const { getDapp } = useDapps();
    const { getDappRewards, getUnclaimedDappRewardsPerPeriod, claimDappRewards } = useDappStaking();
    const { navigateToHome } = useDappStakingNavigation();
    const dappAddress = computed<string>(() => route.query.dapp as string);

    const dapp = computed<CombinedDappInfo | undefined>(() => getDapp(dappAddress.value));
    const totalRewards = ref<bigint>(BigInt(0));
    const rewardsPerPeriod = ref<RewardsPerPeriod[]>([]);

    const fetchRewards = async () => {
      if (dapp.value) {
        [totalRewards.value, rewardsPerPeriod.value] = await Promise.all([
          getDappRewards(dapp.value.chain.address),
          getUnclaimedDappRewardsPerPeriod(dapp.value.chain.address),
        ]);
      }
    };

    const claimRewards = async () => {
      if (dapp.value) {
        await claimDappRewards(dapp.value.chain.address);
        await fetchRewards();
      }
    };

    watch(
      [dapp],
      (oldDapp, newDapp) => {
        if (newDapp) {
          fetchRewards();
        } else if (!newDapp && !oldDapp) {
          navigateToHome();
        }
      },
      { immediate: true }
    );

    return {
      dappAddress,
      dapp,
      totalRewards,
      rewardsPerPeriod,
      claimRewards,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/owner.scss';
</style>
