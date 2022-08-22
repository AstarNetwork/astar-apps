<template>
  <div id="assets-top">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import { scrollTo } from 'src/hooks/helper/common';

export default defineComponent({
  setup() {
    useMeta({ title: 'Assets' });
  },
  mounted() {
    // Memo: scrollBehavior in createRouter is not working
    scrollTo('assets-top');
  },
});
</script>
