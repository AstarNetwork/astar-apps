<template>
  <div v-if="isReady">
    <dapp-v3 v-if="isDappStakingV3" />
    <div v-else class="dapp-top"><dapp /></div>
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import Dapp from 'src/components/dapp-staking/dapp/Dapp.vue';
import DappV3 from 'src/staking-v3/components/dapp/DappV3.vue';
import { generateMeta } from 'src/config/metadata';
import { usePageReady } from 'src/hooks';
import { Path } from 'src/router';
import { defineComponent } from 'vue';
import { useDappStaking } from 'src/staking-v3';

export default defineComponent({
  components: {
    Dapp,
    DappV3,
  },
  setup() {
    useMeta(generateMeta(Path.Dapp));
    const { isReady } = usePageReady();
    const { isDappStakingV3 } = useDappStaking();
    return { isReady, isDappStakingV3 };
  },
});
</script>
<style lang="scss" scoped>
.dapp-top {
  padding: 0 16px;
}
</style>
