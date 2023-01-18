<template>
  <div class="divider">
    <div class="first--vector"></div>
    <div class="year">2023</div>
    <div class="last--vector"></div>
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
  top: 87px;
  left: 0px;
  display: flex;
  align-items: center;
  width: 100%;
  z-index: 9999;
}
.first--vector {
  width: 80px;
  height: 2px;
  background: linear-gradient(
    270.04deg,
    #fdc605 -1.11%,
    #793b02 32.1%,
    #d9802e 69%,
    #793b02 104.05%
  );
}
.year {
  font-style: normal;
  font-weight: 900;
  font-size: 16px;
  line-height: 19px;
  background: linear-gradient(180deg, #fdc605 0%, #793b02 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.5);
  margin-left: 10px;
  margin-right: 10px;
}
.last--vector {
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