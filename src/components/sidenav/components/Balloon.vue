<template>
  <div
    v-if="isBalloon"
    class="animate__animated animate__fadeIn"
    :class="[`balloon-right`, isBalloonClosing && 'animate__fadeOut']"
  >
    <div class="balloon_text-box">
      <span class="text--ballon">
        {{ text }}
      </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isBalloon: {
      type: Boolean,
      required: true,
    },
    isBalloonClosing: {
      type: Boolean,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/sidenav/styles/balloon.scss';
</style>
