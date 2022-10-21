<template>
  <dapp class="dapp-top" />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';
import Dapp from 'src/components/dapp-staking/dapp/Dapp.vue';

export default defineComponent({
  components: { Dapp },
  setup() {
    useMeta({ title: 'dApps Staking' });
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
