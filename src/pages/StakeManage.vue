<template>
  <stake-manage v-if="isReady" class="stake-top" />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';
import StakeManage from 'src/components/dapp-staking/stake-manage/StakeManage.vue';
import { generateMeta } from 'src/config/metadata';
import { Path } from 'src/router';
import { usePageReady } from 'src/hooks';
export default defineComponent({
  components: { StakeManage },
  setup() {
    useMeta(generateMeta(Path.Stake));
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
<style lang="scss" scoped>
.stake-top {
  padding: 0 16px;
}
</style>
