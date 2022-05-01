<template>
  <div class="loader">
    <div class="one"></div>
    <div class="two"></div>
    <div class="three"></div>
    <div class="four"></div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({});
</script>

<style scoped>
.loader {
  position: absolute;
  top: calc(50% - 32px);
  left: calc(50% - 32px);
  width: 80px;
  height: 80px;
}

.loader div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-sizing: border-box;
  opacity: 0.8;
}

.one {
  border-top: 1px solid #05b6fd;
  animation: rotate-left 1.5s linear infinite;
}

.two {
  border-right: 1px solid #05b6fd;
  animation: rotate-right 1.5s linear infinite;
}

.three {
  border-bottom: 1px solid #0085ff;
  animation: rotate-right 1.5s linear infinite;
}

.four {
  border-left: 1px solid #0085ff;
  animation: rotate-right 1.5s linear infinite;
}

@keyframes rotate-left {
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes rotate-right {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
