<template>
  <router-view id="assets" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import { scrollToId } from 'src/hooks/helper/common';

export default defineComponent({
  setup() {
    useMeta({ title: 'Assets' });
  },
  mounted() {
    // Memo: scrollBehavior in createRouter is not working
    scrollToId('assets');
  },
});
</script>
