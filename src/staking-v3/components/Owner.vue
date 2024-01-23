<template>
  <div>
    <div v-if="dappAddress && dapp" class="wrapper--owner">
      <div class="row--your-dashboard">
        <span>{{ $t('stakingV3.yourDashboard') }}</span>
      </div>
      <div class="container--dapp-hero">
        <img :src="dapp.basic.iconUrl" alt="icon" class="img--dapp-icon" />
        <span class="text--dapp-name">{{ dapp.basic.name }}</span> ({{ dapp.chain.state }})
        <div class="row--your-dashboard-mobile">
          <span>{{ $t('stakingV3.yourDashboard') }}</span>
        </div>
      </div>
      <div class="row--statistics">
        <kpi-card :title="$t('stakingV3.currentTier')">{{
          getDappTier(dapp.chain.id) ?? '--'
        }}</kpi-card>
        <kpi-card :title="$t('stakingV3.numberOfStakers')">
          {{ dapp.dappDetails?.stakersCount ?? '--' }}
        </kpi-card>
        <kpi-card :title="$t('stakingV3.totalEarned')"> -- </kpi-card>
      </div>
      <your-rewards
        :total-rewards="totalRewards"
        :rewards-per-period="rewardsPerPeriod"
        :claim-rewards="claimRewards"
      />
      <edit />
    </div>
    <div class="bg--owner" />
    <dapp-background :dapp="dapp" />
  </div>
</template>

<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { computed, defineComponent, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDapps, useDappStakingNavigation, useDappStaking, RewardsPerPeriod } from '../hooks';
import { CombinedDappInfo } from '../logic';
import Edit from './Edit.vue';
import KpiCard from './KpiCard.vue';
import YourRewards from './YourRewards.vue';
import DappBackground from './dapp/DappBackground.vue';

export default defineComponent({
  components: { KpiCard, YourRewards, Edit, DappBackground },
  setup() {
    const route = useRoute();
    const { nativeTokenSymbol } = useNetworkInfo();
    const { getDapp } = useDapps();
    const { getDappTier, getDappRewards, getUnclaimedDappRewardsPerPeriod, claimDappRewards } =
      useDappStaking();
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
      nativeTokenSymbol,
      totalRewards,
      rewardsPerPeriod,
      getDappTier,
      claimRewards,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/owner.scss';
</style>
