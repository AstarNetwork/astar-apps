<template>
  <div class="banner" :class="`banner--${network}`">
    {{ network !== 2 ? $t('warning.claimRewards') : $t('warning.underDevelopmentShibuyaWarning') }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    network: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.banner {
  color: $gray-2;
  font-weight: 600;
  padding: 4px 16px 8px 16px;
  line-height: 1.25;
  font-size: 12px;
  @media (min-width: $sm) {
    font-size: 14px;
  }

  // shibuya, zKatana, local
  background: linear-gradient(90deg, #6c6c6c 25%, #b7b7b7 100%);

  // astar native
  &.banner--0 {
    background: linear-gradient(90deg, #e6007a 25%, #ff9dd1 100%);
  }

  // shiden
  &.banner--1 {
    background: linear-gradient(90deg, #5928b1 25%, #b092ea 100%);
  }

  // zkEVM
  &.banner--3 {
    background: linear-gradient(90deg, #703ac2 25%, #226dff 100%);
  }
}
</style>
