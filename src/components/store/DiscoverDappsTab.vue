<template>
  Discover
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useStore } from 'src/store';

export default defineComponent({
  setup() {
    const store = useStore();

    store.dispatch('dapps/getDapps');
  },
})
</script>

