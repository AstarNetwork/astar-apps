<template>
  <div class="wrapper--vote">
    <div>{{ $t('stakingV3.voteTitle') }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--vote {
  padding: 16px;
}

.title {
  color: var(--Navy01, #081029);
  font-size: 32px;
  font-style: normal;
  font-weight: 800;
  line-height: normal;
  letter-spacing: -0.64px;
}
</style>
