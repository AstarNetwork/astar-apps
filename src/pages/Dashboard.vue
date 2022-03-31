<template>
  <dashboard />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Dashboard from 'src/components/dashboard/Dashboard.vue';

export default defineComponent({
  components: {
    Dashboard,
  },
  setup() {
    useMeta({ title: 'Dashboard' });
  },
});
</script>
