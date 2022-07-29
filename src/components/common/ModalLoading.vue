<template>
  <div class="overlay">
    <div class="spinner-box">
      <astar-spinner />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({});
</script>
<style scoped lang="scss">
@import 'src/css/quasar.variables.scss';
.loader {
  min-height: 100px;
  min-width: 100px;
}

.overlay {
  background: rgba(0, 0, 0, 0.1);
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 104px;
  @media (min-width: $lg) {
    top: 96px;
    left: 224px;
  }
}
.spinner-box {
  position: absolute;
  width: 100vw;
  top: 38%;
  left: -18px;
  @media (min-width: $lg) {
    margin-left: -224px;
  }
}

.body--dark {
  .overlay {
    background: rgba(0, 0, 0, 0.5);
  }
}
</style>
