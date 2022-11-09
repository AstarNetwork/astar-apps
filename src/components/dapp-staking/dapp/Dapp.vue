<template>
  <div v-if="dapp">
    <back-to-page :text="$t('dappStaking.stakePage.backToDappList')" :link="Path.DappStaking" />
    <dapp-avatar :dapp="dapp" />
    <dapp-statistics :dapp="dapp" />
    <dapp-images :dapp="dapp" />
    <builders :dapp="dapp" />
    <div class="row--project-overview">
      <project-overview :dapp="dapp" />
      <project-details :dapp="dapp" />
    </div>
    <div class="bottom--links">
      <router-link :to="buildStakePageLink(dapp.dapp.address)">
        <div class="text--stake-switch">
          {{ $t('dappStaking.dappPage.stakeOrSwitchTo') }} {{ dapp.dapp.name }}
        </div>
      </router-link>
      <back-to-page :text="$t('dappStaking.stakePage.backToDappList')" :link="Path.DappStaking" />
    </div>
  </div>
</template>
<script lang="ts">
import { useNetworkInfo, useStakingList, useDappRedirect } from 'src/hooks';
import { Path } from 'src/router';
import { networkParam } from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import DappAvatar from 'src/components/dapp-staking/dapp/DappAvatar.vue';
import DappStatistics from 'src/components/dapp-staking/dapp/DappStatistics.vue';
import DappImages from 'src/components/dapp-staking/dapp/DappImages.vue';
import Builders from 'src/components/dapp-staking/dapp/Builders.vue';
import ProjectOverview from 'src/components/dapp-staking/dapp/ProjectOverview.vue';
import ProjectDetails from 'src/components/dapp-staking/dapp/ProjectDetails.vue';
import BackToPage from 'src/components/common/BackToPage.vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {
    DappAvatar,
    DappStatistics,
    DappImages,
    Builders,
    ProjectOverview,
    ProjectDetails,
    BackToPage,
  },
  setup() {
    const { currentNetworkName } = useNetworkInfo();
    const route = useRoute();
    useDappRedirect();
    const { t } = useI18n();
    const store = useStore();
    const { dapps, stakingList } = useStakingList();
    const dappAddress = computed<string>(() => route.query.dapp as string);
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

    const buildStakePageLink = (address: string): string => {
      const base = networkParam + Path.DappStaking + Path.Stake;
      return `${base}?dapp=${address.toLowerCase()}`;
    };

    const dispatchGetDapps = (): void => {
      const isDispatch = currentNetworkName.value && dapps.value.length === 0;
      if (isDispatch) {
        store.dispatch('dapps/getDapps', {
          network: currentNetworkName.value.toLowerCase(),
          currentAccount: '',
        });
      }
      if (isH160.value) {
        store.dispatch('general/showAlertMsg', {
          msg: t('dappStaking.error.onlySupportsSubstrate'),
          alertType: 'error',
        });
      }
    };

    const dapp = computed(() => {
      if (dapps.value.length > 0 && dappAddress.value) {
        // Todo: fix the type annotation
        return dapps.value.find((it: any) => {
          try {
            return it.dapp.address.toLowerCase() === dappAddress.value.toLowerCase();
          } catch (error) {
            return null;
          }
        });
      }
      return null;
    });
    watchEffect(dispatchGetDapps);

    return {
      Path,
      dapp,
      stakingList,
      buildStakePageLink,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp.scss';
</style>
