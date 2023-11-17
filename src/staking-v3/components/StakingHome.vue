<template>
  <div class="main--wrapper">
    <h4>Hello from dApp Staking v3</h4>
    <br />
    <p>Protocol state: {{ protocolState }}</p>
    <br />
    <div v-for="(dapp, index) in registeredDapps" :key="index">
      <button @click="stake(dapp.chain.address, 1000)">Stake</button> |
      <button @click="unstake(dapp.chain.address, 10)">Unstake</button> |
      <button :disabled="!canClaimStakerRewards()" @click="claimStakerRewards()">
        Claim staker
      </button>
      | <button :disabled="!canClaimDappRewards()" @click="claimDappRewards()">Claim dApp</button> |
      <button :disabled="!canClaimBonusRewards()" @click="claimBonusRewards()">Claim bonus</button>
      | <button @click="fetchDappToStore(dapp.chain.address)">Details</button> | [{{
        dapp.chain.address
      }}]
      <b>{{ dapp.basic.name }}</b>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, watchEffect } from 'vue';
import { useDapps, useDappStaking } from '../hooks';
import { useAccount } from 'src/hooks';

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
      getAllRewards,
      canClaimBonusRewards,
      canClaimDappRewards,
      canClaimStakerRewards,
    } = useDappStaking();
    const { currentAccount } = useAccount();

    onMounted(async () => {
      await fetchDappsToStore();
    });

    watch([currentAccount], async () => {
      if (currentAccount) {
        await getAllRewards();
      }
    });

    watchEffect(() => {
      console.log('registeredDapps', registeredDapps.value);
      console.log('protocolState', protocolState.value);
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
      canClaimBonusRewards,
      canClaimDappRewards,
      canClaimStakerRewards,
    };
  },
});
</script>

<style scoped>
.main--wrapper {
  margin-bottom: 40px;
}
</style>
