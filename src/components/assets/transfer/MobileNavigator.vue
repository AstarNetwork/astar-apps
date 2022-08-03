<template>
  <div class="container--mobile-navigator">
    <button class="circle--button">
      <astar-icon-group :size="size" />
      <span>FAQ</span>
    </button>
    <button class="circle--button">
      <astar-icon-history :size="size" />
      <span>Recent History</span>
    </button>
    <button class="circle--button">
      <astar-icon-group :size="size" />
      <span>Hot Topic</span>
    </button>
  </div>
</template>
<script lang="ts">
import { useBreakpoints } from 'src/hooks';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  setup() {
    const { screenSize, width } = useBreakpoints();
    const size = computed(() => (width.value > screenSize.sm ? '24' : '21'));

    return {
      screenSize,
      size,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/mobile-navigator.scss';
</style>
