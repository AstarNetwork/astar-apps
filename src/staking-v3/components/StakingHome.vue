<template>
  <div class="main-wrapper">
    <p>Hello from dApp Staking v3</p>
    <div v-for="(dapp, index) in dapps" :key="index">
      <button @click="stake(dapp.address, 10)">Stake</button> |
      <button @click="unstake(dapp.address, 10)">Unstake</button> |
      <b>{{ dapp.name }}</b>
    </div>
  </div>
</template>

<script lang="ts">
import StakeFormVue from 'src/components/dapp-staking/stake-manage/StakeForm.vue';
import { defineComponent, onMounted, ref } from 'vue';
import { useDapps } from '../hooks';
import { DappBase } from '../logic';

export default defineComponent({
  setup() {
    const { getDapps, stake, unstake } = useDapps();
    const dapps = ref<DappBase[]>([]);

    onMounted(async () => {
      dapps.value = await getDapps();
    });

    return { dapps, stake, unstake };
  },
});
</script>

<style scoped>
.main-wrapper {
  margin-top: 40px;
}
</style>
