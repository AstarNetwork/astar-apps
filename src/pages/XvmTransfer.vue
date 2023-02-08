<template>
  <xvm-transfer v-if="isReady" />
  <div v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import XvmTransfer from 'src/components/assets/transfer/XvmTransfer.vue';
import { usePageReady } from 'src/hooks';
import { generateMeta, meta } from 'src/config/metadata';
import { Path } from 'src/router';

export default defineComponent({
  components: { XvmTransfer },
  setup() {
    useMeta(generateMeta(Path.XvmTransfer));
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
