<template>
  <button type="button" class="btn--connect">
    <astar-icon-base class="iconbase" stroke="currentColor">
      <slot />
    </astar-icon-base>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useBreakpoints } from 'src/hooks';

export default defineComponent({
  setup() {
    const { width, screenSize } = useBreakpoints();

    return {
      width,
      screenSize,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.btn--connect {
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: solid 1px white;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
  &:hover {
    border-color: $astar-blue;
    background-color: $astar-blue;
  }
  @media (min-width: $lg) {
    width: 40px;
    height: 40px;
    border-radius: 20px;
  }
}

.iconbase {
  width: 18px;
  height: 18px;
  @media (min-width: $lg) {
    width: 20px;
    height: 20px;
  }
}
</style>
