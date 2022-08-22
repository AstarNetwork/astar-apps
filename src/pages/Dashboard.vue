<template>
  <dashboard id="top-dashboard" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Dashboard from 'src/components/dashboard/Dashboard.vue';
import { scrollTo } from 'src/hooks/helper/common';

export default defineComponent({
  components: {
    Dashboard,
  },
  setup() {
    useMeta({ title: 'Dashboard' });
  },
  mounted() {
    // Memo: scrollBehavior in createRouter is not working
    scrollTo('top-dashboard');
  },
});
</script>
