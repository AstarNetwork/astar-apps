<template>
  <transfer v-if="isReady" />
  <div v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Transfer from 'src/components/assets/transfer/Transfer.vue';
import { usePageReady } from 'src/hooks';
import { generateMeta } from 'src/config/metadata';
import { Path } from 'src/router';

export default defineComponent({
  components: { Transfer },
  setup() {
    useMeta(generateMeta(Path.Transfer));
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
