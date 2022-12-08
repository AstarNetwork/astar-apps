<template>
  <div
    class="pie animate"
    :style="`--p: ${percentage}; --b: ${bold}; --w: ${width}; --c: ${color};`"
  >
    <div class="percentage" :style="`--f: ${fontSize};`">
      <span> {{ percentage }}% </span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

// Todo: add to Astar-UI
// Ref: https://www.freecodecamp.org/news/css-only-pie-chart/
export default defineComponent({
  props: {
    percentage: {
      type: Number,
      required: true,
    },
    bold: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    fontSize: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@property --p {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.pie {
  width: var(--w);
  aspect-ratio: 1;
  position: relative;
  display: inline-grid;
  margin: 5px;
  place-content: center;
}

.percentage {
  font-size: var(--f);
}

.pie:before,
.pie:after {
  content: '';
  position: absolute;
  border-radius: 50%;
}
.pie:before {
  inset: 0;
  background: radial-gradient(farthest-side, var(--c) 98%, #0000) top/var(--b) var(--b) no-repeat,
    conic-gradient(var(--c) calc(var(--p) * 1%), #0000 0);
  -webkit-mask: radial-gradient(
    farthest-side,
    #0000 calc(99% - var(--b)),
    #000 calc(100% - var(--b))
  );
  mask: radial-gradient(farthest-side, #0000 calc(99% - var(--b)), #000 calc(100% - var(--b)));
}
.pie:after {
  inset: calc(50% - var(--b) / 2);
  background: var(--c);
  transform: rotate(calc(var(--p) * 3.6deg)) translateY(calc(50% - var(--w) / 2));
}
.animate {
  animation: p 1s 0.8s both;
}
.no-round:before {
  background-size: 0 0, auto;
}
.no-round:after {
  content: none;
}
@keyframes p {
  from {
    --p: 0;
  }
}
</style>
