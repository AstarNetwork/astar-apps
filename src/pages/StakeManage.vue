<template>
  <stake-manage class="stake-top" />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';
import StakeManage from 'src/components/dapp-staking/stake-manage/StakeManage.vue';
import { generateMeta } from 'src/config/metadata';
import { Path } from 'src/router';
export default defineComponent({
  components: { StakeManage },
  setup() {
    useMeta(generateMeta(Path.Stake));
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
