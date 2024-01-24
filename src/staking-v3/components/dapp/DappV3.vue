<template>
  <div>
    <div v-if="dapp && dapp.extended" class="wrapper--dapp">
      <div class="container--dapp-top">
        <back-to-page :text="$t('dappStaking.stakePage.backToDappList')" :link="Path.DappStaking" />

        <Transition>
          <div v-if="!isVisible" class="wrapper--small-header">
            <dapp-avatar :dapp="dapp" small />
            <dapp-statistics :dapp="dapp" small />
          </div>
        </Transition>

        <div v-intersection="onIntersection" class="row--dapp-header">
          <dapp-avatar :dapp="dapp" />
          <dapp-statistics :dapp="dapp" />
        </div>

        <dapp-images :dapp="dapp" />
      </div>

      <div
        class="container--dapp-bottom"
        :style="{ backgroundImage: `url(${require('src/staking-v3/assets/grid_bg.svg')})` }"
      >
        <div class="container--dapp-bottom__inner">
          <builders :dapp="dapp" />
          <div>
            <div class="text--title">{{ $t('stakingV3.dapp.overview') }}</div>
            <div class="row--project-overview">
              <project-overview :dapp="dapp" />
              <project-details :dapp="dapp" class="project--details" />
            </div>
          </div>
          <!-- <dapp-stats-charts :dapp="dapp" /> -->
        </div>
      </div>
    </div>
    <div class="bg--dapp" />
    <dapp-icon-background :dapp="dapp" />
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
import { computed, defineComponent, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useDapps, useDappStakingNavigation } from '../../hooks';
import { CombinedDappInfo, IDappStakingRepository } from 'src/staking-v3/logic';
import DappIconBackground from './DappIconBackground.vue';

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
    DappIconBackground,
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
        if (!dapp.value) {
          return;
        }
        store.commit('general/setLoading', true, { root: true });
        const repository = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
        const loadedDapp = await repository.getDapp(
          currentNetworkName.value.toLowerCase(),
          dapp.value.chain.address
        );
        if (loadedDapp) {
          store.commit('stakingV3/updateDappExtended', loadedDapp);
        }
      } finally {
        store.commit('general/setLoading', false, { root: true });
      }
    };

    watch(
      [dapp, registeredDapps],
      (oldDapp, newDapp) => {
        if (newDapp != undefined) {
          getDappFromApi();
        } else if (registeredDapps.value.length > 0 && !newDapp && !oldDapp) {
          navigateToHome();
        }
      },
      { immediate: true }
    );

    const twitterUrl = `https://twitter.com/intent/tweet?text=Nominate and Stake with us on @AstarNetwork!&hashtags=dAppStaking,Build2Earn&url=${window.location.href}`;

    const isVisible = ref(true);

    const onIntersection = (entry: any) => {
      isVisible.value = entry.isIntersecting;
    };

    return {
      Path,
      dapp,
      goLink,
      navigateToVote,
      isZkEvm,
      twitterUrl,
      isVisible,
      onIntersection,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp.scss';
</style>
