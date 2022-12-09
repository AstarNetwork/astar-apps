<template>
  <xvm-transfer v-if="isReady" />
  <div v-else />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import XvmTransfer from 'src/components/assets/transfer/XvmTransfer.vue';
import { usePageReady } from 'src/hooks';

export default defineComponent({
  components: { XvmTransfer },
  setup() {
    useMeta({ title: 'XVM Transfer' });
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
