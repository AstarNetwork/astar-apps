<template>
  <div class="banner">
    <span>
      <span class="text--attention">{{ $t('warning.attention') }}</span>
      <span>{{ $t('warning.zkevmUnderMaintenance') }}</span>
    </span>
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

.banner {
  background-color: $border-yellow;
  color: $navy-2;
  font-weight: 600;
  padding: 4px 8px 8px 8px;
  font-size: 12px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  @media (min-width: $sm) {
    font-size: 14px;
    padding: 4px 16px 8px 16px;
  }
}

.text--attention {
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 4px;
  border: 1px solid $navy-2;
  margin-right: 4px;
  @media (min-width: $sm) {
    margin-right: 8px;
  }
}
</style>
