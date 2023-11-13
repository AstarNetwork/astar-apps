<template>
  <div class="main--wrapper">
    <h4>Hello from dApp Staking v3</h4>
    <br />
    <p>Protocol state: {{ protocolState }}</p>
    <br />
    <div v-for="(dapp, index) in registeredDapps" :key="index">
      <button @click="stake(dapp.chain.address, 1000)">Stake</button> |
      <button @click="unstake(dapp.chain.address, 10)">Unstake</button> |
      <button :disabled="!rewards?.staker" @click="claimStakerRewards()">Claim staker</button> |
      <button :disabled="!rewards?.dApp" @click="claimDappRewards()">Claim dApp</button> |
      <button :disabled="!rewards?.bonus" @click="claimBonusRewards()">Claim bonus</button> |
      <button @click="fetchDappToStore(dapp.chain.address)">Details</button> | [{{
        dapp.chain.address
      }}]
      <b>{{ dapp.basic.name }}</b>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useDapps, useDappStaking } from '../hooks';

export default defineComponent({
  setup() {
    const { registeredDapps, fetchDappsToStore, fetchDappToStore } = useDapps();
    const {
      protocolState,
      rewards,
      stake,
      unstake,
      claimStakerRewards,
      claimDappRewards,
      claimBonusRewards,
    } = useDappStaking();

    onMounted(async () => {
      await fetchDappsToStore();
    });

    return {
      registeredDapps,
      protocolState,
      rewards,
      stake,
      unstake,
      fetchDappToStore,
      claimStakerRewards,
      claimDappRewards,
      claimBonusRewards,
    };
  },
});
</script>

<style scoped>
.main--wrapper {
  margin-top: 40px;
}
</style>
