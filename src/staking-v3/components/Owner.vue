<template>
  <div v-if="dappAddress && dapp" class="wrapper--owner">
    <div class="row--your-dashboard">
      <span>Your dashboard</span>
    </div>
    <div class="container--dapp-hero">
      <img :src="dapp.basic.iconUrl" alt="icon" class="img--dapp-icon" />
      <span class="text--dapp-name">{{ dapp.basic.name }}</span>
      <div class="row--your-dashboard-mobile">
        <span>Your dashboard</span>
      </div>
    </div>
    <div class="row--statistics">
      <kpi-card :title="$t('dappStaking.dappPage.v3.currentTier')">2</kpi-card>
      <kpi-card :title="$t('dappStaking.dappPage.v3.numberOfStakers')">100</kpi-card>
      <kpi-card :title="$t('dappStaking.dappPage.v3.totalEarned')">{{
        $t('amountToken', { amount: 100, token: nativeTokenSymbol })
      }}</kpi-card>
    </div>
    <div>
      <your-rewards />
    </div>
    <div>Edit</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useDapps } from '../hooks';
import { CombinedDappInfo } from '../logic';
import KpiCard from './KpiCard.vue';
import YourRewards from './YourRewards.vue';
import { useNetworkInfo } from 'src/hooks';

export default defineComponent({
  components: { KpiCard, YourRewards },
  // Todo: redirect to discover page if the connected account is not the owner
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
    watchEffect(() => {
      console.log('dapp', dapp.value);
    });
    return { dappAddress, dapp, nativeTokenSymbol };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/owner.scss';
</style>
