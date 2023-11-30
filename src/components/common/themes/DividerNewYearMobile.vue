<template>
  <div class="divider">
    <div class="vector"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {},
});
</script>
<style lang="scss" scoped>
.divider {
  position: absolute;
  top: 63px;
  left: 0px;
  width: 100%;
  z-index: 99;
}
.vector {
  width: 100%;
  height: 2px;
  background: linear-gradient(
    270.04deg,
    #fdc605 -1.11%,
    #793b02 32.1%,
    #d9802e 69%,
    #793b02 104.05%
  );
}
</style>
