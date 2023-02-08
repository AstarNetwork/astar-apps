<template>
  <dapp v-if="isReady" class="dapp-top" />
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import Dapp from 'src/components/dapp-staking/dapp/Dapp.vue';
import { meta } from 'src/config/metadata';
import { usePageReady } from 'src/hooks';
import { defineComponent } from 'vue';

export default defineComponent({
  components: { Dapp },
  setup() {
    useMeta({
      title: meta.title.dappsStaking.dappStaking,
      meta: {
        description: {
          name: 'description',
          content: meta.description.dappsStaking,
        },
      },
    });
    const { isReady } = usePageReady();
    return { isReady };
  },
});
</script>
<style lang="scss" scoped>
.dapp-top {
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}
</style>
