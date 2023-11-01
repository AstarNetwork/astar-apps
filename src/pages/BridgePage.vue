<template>
  <div v-if="isReady" class="page--bridge">
    <!-- Fixme: scroll to top when the app was routed from other page -->
    <router-view id="bridge-top" />
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { generateMeta } from 'src/config/metadata';
import { usePageReady } from 'src/hooks';
import { Path } from 'src/router';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  setup() {
    useMeta(generateMeta(Path.Bridge));
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
<style lang="scss" scoped>
#bridge-top {
  @media (min-width: $lg) {
    margin-top: 50px;
    padding: 0 16px;
  }
}

.page--bridge {
  @media (min-width: $lg) {
    height: calc(100vh - 160px);
  }
}
</style>
