<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';

export default defineComponent({
  setup() {
    useMeta({ title: 'Bridge' });
  },
});
</script>
<style>
.dark\:tw-bg-blue-500 {
  background-color: rgba(27, 109, 193, 0.1) !important;
}
.checked\:tw-border-blue-500:checked {
  border-color: rgba(27, 109, 193, 1) !important;
}
</style>
