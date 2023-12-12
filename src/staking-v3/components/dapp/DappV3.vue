<template>
  <div v-if="dapp && dapp.extended" class="container--dapp-staking">
    <back-to-page :text="$t('dappStaking.stakePage.backToDappList')" :link="Path.DappStaking" />
    <dapp-avatar :dapp="dapp" />
    <dapp-statistics :dapp="dapp" />
    <dapp-images :dapp="dapp" />
    <builders :dapp="dapp" />
    <div class="row--project-overview">
      <project-overview :dapp="dapp" />
      <project-details :dapp="dapp" class="project--details" />
    </div>
    <!-- <dapp-stats-charts :dapp="dapp" /> -->
    <div class="bottom--links">
      <div @click="navigateToVote(dapp.chain.address)">
        <astar-irregular-button :height="28" class="btn--stake-switch" :disabled="isZkEvm">
          {{ $t('dappStaking.dappPage.stakeOrSwitchTo') }} {{ dapp.extended.name }}
        </astar-irregular-button>
      </div>
      <back-to-page :text="$t('dappStaking.stakePage.backToDappList')" :link="Path.DappStaking" />
    </div>
  </div>
</template>
<script lang="ts">
import BackToPage from 'src/components/common/BackToPage.vue';
import Builders from './Builders.vue';
import DappAvatar from './DappAvatar.vue';
import DappImages from './DappImages.vue';
import DappStatistics from './DappStatistics.vue';
// import DappStatsCharts from './DappStatsCharts.vue';
import ProjectDetails from './ProjectDetails.vue';
import ProjectOverview from './ProjectOverview.vue';
import { useNetworkInfo } from 'src/hooks';
import { Path } from 'src/router';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { computed, defineComponent, watch, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { useDapps, useDappStakingNavigation } from '../../hooks';
import { CombinedDappInfo, IDappStakingRepository } from 'src/staking-v3/logic';

export default defineComponent({
  components: {
    DappAvatar,
    DappStatistics,
    DappImages,
    Builders,
    ProjectOverview,
    ProjectDetails,
    BackToPage,
    // DappStatsCharts,
  },
  setup() {
    const route = useRoute();
    const { currentNetworkName, isZkEvm } = useNetworkInfo();
    const { getDapp, registeredDapps } = useDapps();
    const { navigateToVote, navigateToHome } = useDappStakingNavigation();
    const store = useStore();

    const dappAddress = computed<string>(() => route.query.dapp as string);

    const goLink = (url: string) => {
      window.open(url, '_blank');
    };

    const dapp = computed<CombinedDappInfo | undefined>(() => getDapp(dappAddress.value));

    // Fetch full dApp model from API. Initially, store contains dapp with props required for the main page.
    const getDappFromApi = async () => {
      if (dapp.value?.extended) {
        // Full dapp model is already loaded to the store. No need to fetch dapp from API.
        return;
      }
      try {
        store.commit('general/setLoading', true, { root: true });
        const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
        const loadedDapp = await repository.getDapp(
          currentNetworkName.value.toLowerCase(),
          dappAddress.value
        );
        if (loadedDapp) {
          store.commit('stakingV3/updateDappExtended', loadedDapp);
        }
      } finally {
        store.commit('general/setLoading', false, { root: true });
      }
    };

    onBeforeMount(() => {
      if (!dapp.value) {
        navigateToHome();
      }
    });

    watch(
      [dapp, registeredDapps],
      () => {
        if (dapp != undefined) {
          getDappFromApi();
        }
      },
      { immediate: true }
    );

    return {
      Path,
      dapp,
      goLink,
      navigateToVote,
      isZkEvm,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp.scss';
</style>
