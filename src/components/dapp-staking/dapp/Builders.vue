<template>
  <div v-if="dapp" class="wrapper--builders">
    <div class="row--builders-title">
      <span class="text--xl"> {{ $t('dappStaking.dappPage.builders') }}</span>
    </div>
    <div class="box--builders">
      <div class="card--builders">
        <div class="row--details">
          <img class="image--builder-icon" :src="dapp.dapp.iconUrl" :alt="dapp.dapp.name" />
          <div>
            <div class="text--name">Name</div>
            <div class="text--position">Lead dev</div>
          </div>
        </div>
        <div class="row--icons">
          <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Twitter">
            <astar-icon-twitter />
          </astar-icon-base>
          <astar-icon-base class="icon" viewBox="0 0 448 512" icon-name="Twitter">
            <astar-icon-github />
          </astar-icon-base>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/builders.scss';
</style>
