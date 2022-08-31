<template>
  <div>
    <h2>Welcome to dApps staking v2</h2>
    <div>
      Total dApps <b>{{ dappsCount }}</b>
    </div>
    <div>
      Current block <b>{{ currentBlock }}</b>
    </div>
    <div>
      Current era <b>{{ currentEra }}</b>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';

export default defineComponent({
  setup() {
    const store = useStore();
    const dappsCount = computed<number>(() => store.getters['dapps/getRegisteredDapps']().length);
    const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);
    const currentEra = computed<number>(() => store.getters['dapps/getCurrentEra']);

    return {
      dappsCount,
      currentBlock,
      currentEra,
    };
  },
});
</script>
