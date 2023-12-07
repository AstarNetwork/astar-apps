<template>
  <div v-if="dappAddress && dapp" class="wrapper--owner">
    <div class="row--your-dashboard">
      <span>{{ $t('stakingV3.yourDashboard') }}</span>
    </div>
    <div class="container--dapp-hero">
      <img :src="dapp.basic.iconUrl" alt="icon" class="img--dapp-icon" />
      <span class="text--dapp-name">{{ dapp.basic.name }}</span>
      <div class="row--your-dashboard-mobile">
        <span>{{ $t('stakingV3.yourDashboard') }}</span>
      </div>
    </div>
    <div class="row--statistics">
      <kpi-card :title="$t('stakingV3.currentTier')">2</kpi-card>
      <kpi-card :title="$t('stakingV3.numberOfStakers')">100</kpi-card>
      <kpi-card :title="$t('stakingV3.totalEarned')">
        {{ $t('amountToken', { amount: 100, token: nativeTokenSymbol }) }}
      </kpi-card>
    </div>
    <your-rewards />
    <edit />
  </div>
</template>

<script lang="ts">
import { useNetworkInfo } from 'src/hooks';
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useDapps } from '../hooks';
import { CombinedDappInfo } from '../logic';
import Edit from './Edit.vue';
import KpiCard from './KpiCard.vue';
import YourRewards from './YourRewards.vue';

export default defineComponent({
  components: { KpiCard, YourRewards, Edit },
  setup() {
    const route = useRoute();
    const { nativeTokenSymbol } = useNetworkInfo();
    const dappAddress = computed<string>(() => route.query.dapp as string);
    const { registeredDapps } = useDapps();
    const dapp = computed<CombinedDappInfo>(() => {
      return registeredDapps.value.find(
        (dapp) => dapp.chain.address === dappAddress.value
      ) as CombinedDappInfo;
    });

    return { dappAddress, dapp, nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/owner.scss';
</style>
