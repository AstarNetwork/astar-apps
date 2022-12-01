<template>
  <stake-manage class="stake-top" />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';
import StakeManage from 'src/components/dapp-staking-v2/stake-manage/StakeManage.vue';

export default defineComponent({
  components: { StakeManage },
  setup() {
    useMeta({ title: 'Stake' });
  },
});
</script>
<style lang="scss" scoped>
.stake-top {
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}
</style>
