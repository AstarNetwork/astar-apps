<template>
  <xvm-transfer v-if="isReady" />
  <div v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import XvmTransfer from 'src/components/assets/transfer/XvmTransfer.vue';
import { usePageReady } from 'src/hooks';
import { meta } from 'src/config/metadata';

export default defineComponent({
  components: { XvmTransfer },
  setup() {
    useMeta({
      title: meta.title.assets.xvmTransfer,
      meta: {
        description: {
          name: 'description',
          content: meta.description.assets,
        },
      },
    });
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
