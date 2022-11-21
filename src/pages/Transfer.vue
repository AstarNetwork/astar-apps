<template>
  <Transfer v-if="isReady" />
  <div v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Transfer from 'src/components/assets/transfer/Transfer.vue';
import { usePageReady } from 'src/hooks';

export default defineComponent({
  components: { Transfer },
  setup() {
    useMeta({ title: 'Transfer' });
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
