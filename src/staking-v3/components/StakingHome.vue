<template>
  <div class="main-wrapper">
    <p>Hello from dApp Staking v3</p>
    <div v-for="(dapp, index) in dapps" :key="index">
      {{ dapp.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useDapps } from '../hooks';
import { DappBase } from '../logic';

export default defineComponent({
  setup() {
    const { getDapps } = useDapps();
    const dapps = ref<DappBase[]>([]);

    onMounted(async () => {
      dapps.value = await getDapps();
    });

    return { dapps };
  },
});
</script>

<style scoped>
.main-wrapper {
  margin-top: 40px;
}
</style>
