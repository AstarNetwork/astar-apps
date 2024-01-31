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
import { defineComponent } from 'vue';
import { useClaimAll } from 'src/hooks';
import { CombinedDappInfo, useDappStakingNavigation } from 'src/staking-v3';

export default defineComponent({
  props: {
    ownDapps: {
      type: Array<CombinedDappInfo>,
      required: true,
    },
  },
  setup() {
    useClaimAll();
    const { navigateOwnerPage } = useDappStakingNavigation();

    return { navigateOwnerPage };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/your-project.scss';
</style>
