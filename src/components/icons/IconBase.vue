<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :viewBox="viewBox"
    :fill="fill"
    :aria-labelledby="iconName"
    role="presentation"
  >
    <title :id="iconName" lang="en">{{ iconName }} icon</title>
    <g :fill="iconColor">
      <slot />
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    iconName: {
      type: String,
      default: 'box',
    },
    width: {
      type: [Number, String],
      default: undefined,
    },
    height: {
      type: [Number, String],
      default: undefined,
    },
    viewBox: {
      type: String,
      default: '0 0 24 24',
    },
    fill: {
      type: String,
      default: 'none',
    },
    iconColor: {
      type: String,
      default: 'currentColor',
    },
  },
});
</script>
