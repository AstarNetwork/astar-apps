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
          :key="dapp.basic.address"
          :to="navigateOwnerPage(dapp.basic.address)"
          class="card--dapp"
        >
          <img class="icon--dapp-logo" :src="dapp.basic.iconUrl" :alt="dapp.basic.name" />
          <div>
            <span>{{ dapp.basic.name }}</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useAccount, useClaimAll } from 'src/hooks';
import { CombinedDappInfo, useDappStakingNavigation, useDapps } from 'src/staking-v3';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const { currentAccount } = useAccount();
    useClaimAll();
    const { allDapps } = useDapps();
    const { navigateOwnerPage } = useDappStakingNavigation();
    const ownDapps = computed<CombinedDappInfo[]>(() => {
      if (!allDapps.value) return [];
      return allDapps.value.filter((dapp) => dapp.chain.owner === currentAccount.value);
    });

    return { ownDapps, navigateOwnerPage };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/your-project.scss';
</style>
