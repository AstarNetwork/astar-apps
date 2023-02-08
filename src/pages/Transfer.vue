<template>
  <transfer v-if="isReady" />
  <div v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Transfer from 'src/components/assets/transfer/Transfer.vue';
import { usePageReady } from 'src/hooks';
import { meta } from 'src/config/metadata';

export default defineComponent({
  components: { Transfer },
  setup() {
    useMeta({
      title: meta.title.dappsStaking.stake,
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
