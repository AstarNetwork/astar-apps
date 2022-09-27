<template>
  <stake-manage />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';
import StakeManage from 'src/components/dapp-staking/stake-manage/StakeManage.vue';

export default defineComponent({
  components: { StakeManage },
  setup() {
    useMeta({ title: 'Stake' });
  },
});
</script>
