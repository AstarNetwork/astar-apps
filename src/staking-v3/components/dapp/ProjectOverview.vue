<template>
  <div class="wrapper--project-overview">
    <div class="box--overview">
      <!-- eslint-disable vue/no-v-html -->
      <div class="markdown" v-html="sanitizeData(dapp.extended?.description ?? '')" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { sanitizeData } from 'src/hooks/helper/markdown';
import { CombinedDappInfo } from 'src/staking-v3/logic';
export default defineComponent({
  props: {
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
  },
  setup() {
    return { sanitizeData };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/project-overview.scss';
@use 'src/css/markdown.scss';
</style>
