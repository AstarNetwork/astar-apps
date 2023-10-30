<template>
  <div class="animate__animated animate__fadeIn">
    <astar-icon-warning size="20" class="icon" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.icon {
  color: $warning-red;
}
</style>
