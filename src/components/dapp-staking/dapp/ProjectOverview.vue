<template>
  <div class="wrapper--project-overview">
    <div class="row--overview-title">
      <span class="text--xl text--color"> {{ $t('dappStaking.dappPage.projectOverview') }}</span>
    </div>
    <div class="box--overview">
      <!-- eslint-disable vue/no-v-html -->
      <div class="markdown" v-html="sanitizeData(dapp.dapp.description)" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { sanitizeData } from 'src/hooks/helper/markdown';
export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return { sanitizeData };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/project-overview.scss';
@use 'src/css/markdown.scss';
</style>
