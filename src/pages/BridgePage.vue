<template>
  <div v-if="isReady">
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
