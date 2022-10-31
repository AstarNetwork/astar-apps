<template>
  <div class="wrapper--dashboard">
    <dashboard v-if="isReady" />
    <div v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Dashboard from 'src/components/dashboard/Dashboard.vue';
import { usePageReady } from 'src/hooks';

export default defineComponent({
  components: {
    Dashboard,
  },
  setup() {
    useMeta({ title: 'Dashboard' });
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--dashboard {
  @media (min-width: $lg) {
    margin-top: 70px;
  }
}
</style>
