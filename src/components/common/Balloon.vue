<template>
  <div
    v-if="isBalloon"
    class="animate__animated animate__fadeIn"
    :class="[`balloon-${direction}`, isBalloonClosing && 'animate__fadeOut']"
  >
    <div class="balloon__title">
      <div class="balloon__title__mark">
        <div class="icon--check-out" />
        <div class="icon--check">
          <astar-icon-circle-check size="18" />
        </div>
        <span class="text--ballon-title">{{ title }}</span>
      </div>
      <button class="icon--close" @click="handleCloseBalloon">
        <astar-icon-circle-close size="20" />
      </button>
    </div>
    <div class="balloon_text-box">
      <span class="text--ballon">
        {{ text }}
      </span>
    </div>
    <slot />
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
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    direction: {
      type: String,
      required: true,
    },
    handleCloseBalloon: {
      type: Function,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/balloon.scss';
</style>
