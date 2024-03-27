<template>
  <div class="wrapper--dashboard">
    <dashboard v-if="isReady && !isZkEvm" />
    <zk-evm-dashboard v-else-if="isReady && isZkEvm" />
    <div v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Dashboard from 'src/components/dashboard/Dashboard.vue';
import ZkEvmDashboard from 'src/components/dashboard/ZkEvmDashboard.vue';
import { usePageReady, useNetworkInfo } from 'src/hooks';
import { generateMeta } from 'src/config/metadata';
import { Path } from 'src/router';

export default defineComponent({
  components: {
    Dashboard,
    ZkEvmDashboard,
  },
  setup() {
    useMeta(generateMeta(Path.Dashboard));
    const { isReady } = usePageReady();
    const { isZkEvm } = useNetworkInfo();

    return { isReady, isZkEvm };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--dashboard {
  padding: 0 16px;
  @media (min-width: $sm) {
    padding-top: 16px;
  }
  @media (min-width: $lg) {
    padding-left: 40px;
    padding-right: 40px;
    padding-top: 36px;
  }
}
</style>
