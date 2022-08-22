<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';

export default defineComponent({
  setup() {
    useMeta({ title: 'Assets' });
  },
});
</script>
