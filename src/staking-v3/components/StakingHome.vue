<template>
  <div class="main--wrapper">
    <h4>Hello from dApp Staking v3</h4>
    <p>Protocol state: {{ protocolState }}</p>
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
import { useDapps, useDappStaking } from '../hooks';

export default defineComponent({
  setup() {
    const { dappsBasic, fetchDappsToStore, fetchDappToStore, stake, unstake } = useDapps();
    const { protocolState } = useDappStaking();

    onMounted(async () => {
      await fetchDappsToStore();
    });

    return { dappsBasic, protocolState, stake, unstake, fetchDappToStore };
  },
});
</script>

<style scoped>
.main--wrapper {
  margin-top: 40px;
}
</style>
