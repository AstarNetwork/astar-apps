<template>
  <!-- Fixme: scroll to top when the app was routed from other page -->
  <router-view id="assets-top" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';

export default defineComponent({
  setup() {
    useMeta({ title: 'Assets' });
  },
  // mounted() {
  // Memo: scrollBehavior in createRouter is not working
  // Memo: scrollTo doesn't work with fixed header
  // scrollTo('assets-top');
  // },
});
</script>
