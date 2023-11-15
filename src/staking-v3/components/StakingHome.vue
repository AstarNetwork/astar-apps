<template>
  <div class="main--wrapper">
    <h4>Hello from dApp Staking v3</h4>
    <br />
    <p>Protocol state: {{ protocolState }}</p>
    <br />
    <div v-for="(dapp, index) in registeredDapps" :key="index">
      <button @click="navigateToVote()">Vote</button> |
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
import { defineComponent, onMounted, watch } from 'vue';
import { useAccount } from 'src/hooks';
import { useDappStaking, useDapps } from '../hooks';
import { Path, networkParam } from 'src/router/routes';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {},
  setup() {
    const router = useRouter();
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

    const navigateToVote = (): void => {
      const base = networkParam + Path.DappStakingV3 + Path.Vote;
      router.push(base);
    };

    onMounted(async () => {
      await fetchDappsToStore();
    });

    watch([currentAccount], async () => {
      if (currentAccount) {
        await getAllRewards();
      }
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
      navigateToVote,
    };
  },
});
</script>

<style scoped>
.main--wrapper {
  margin-top: 40px;
}
</style>
