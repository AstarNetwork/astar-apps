<template>
  <div v-for="(dapp, index) in dapps" :key="index">{{ dapp.name }}</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from 'src/store';

export default defineComponent({
  setup() {
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);

    store.dispatch('dapps/getDapps');

    return {
      dapps
    }
  },
})
</script>