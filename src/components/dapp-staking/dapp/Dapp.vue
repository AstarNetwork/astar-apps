<template>
  <div v-if="dapp">
    <back-to-page :text="$t('dappStaking.dappPage.back')" :link="Path.DappStaking" />
    <DappAvatar :dapp="dapp" />
    <DappStatistics :dapp="dapp" />
    <DappImages :dapp="dapp" />
    <Builders :dapp="dapp" />
    <div class="row--project-overview">
      <ProjectOverview :dapp="dapp" />
      <ProjectDetails :dapp="dapp" />
    </div>
  </div>
</template>
<script lang="ts">
import { useNetworkInfo, useStakingList } from 'src/hooks';
import { Path } from 'src/router';
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
    const { t } = useI18n();
    const store = useStore();
    const { dapps, stakingList } = useStakingList();
    const dappAddress = computed<string>(() => route.query.dapp as string);
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);

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
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp.scss';
</style>
