<template>
  <div class="main--wrapper">
    <h4>Hello from dApp Staking v3</h4>
    <div v-for="(dapp, index) in dappsBasic" :key="index">
      <button @click="stake(dapp.address, 10)">Stake</button> |
      <button @click="unstake(dapp.address, 10)">Unstake</button> |
      <button @click="fetchDappToStore(dapp.address)">Details</button> |
      <b>{{ dapp.name }}</b>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useDapps } from '../hooks';

export default defineComponent({
  setup() {
    const { dappsBasic, fetchDappsToStore, fetchDappToStore, stake, unstake } = useDapps();

    onMounted(async () => {
      await fetchDappsToStore();
    });

    return { dappsBasic, stake, unstake, fetchDappToStore };
  },
});
</script>

<style scoped>
.main--wrapper {
  margin-top: 40px;
}
</style>
