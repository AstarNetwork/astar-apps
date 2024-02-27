<template>
  <div :class="`wrapper--kpi-card ${description !== '' ? 'flip' : ''}`">
    <div class="card--inner">
      <div class="card--front">
        <div class="card__top">
          <span class="text--card-title">{{ title }}</span>
        </div>
        <div class="card__bottom">
          <slot />
        </div>
      </div>
      <div class="card--back">
        <div>{{ description }}</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { title } from 'process';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup() {
    return {};
  },
});
</script>
<style lang="scss" scoped>
.wrapper--kpi-card {
  color: white;
  flex: 1;
  background-color: transparent;
  height: 110px;
  perspective: 1000px;
  @media (min-width: $sm) {
    min-width: 150px;
    flex: none;
  }
}

.card--inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.wrapper--kpi-card.flip:hover .card--inner {
  transform: rotateY(180deg);
}

.card--front,
.card--back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
  border-radius: 16px;
  padding: 16px 8px;
  @media (min-width: $sm) {
    padding: 16px;
  }
}

.card--front {
  text-align: center;
  background-color: $navy-1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  line-height: 1.25;
  height: 100%;
}

.card__top {
  padding-top: 8px;
  font-style: italic;
  font-weight: 900;
}

.card__bottom {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
}

.card--back {
  background-color: $navy-1;
  color: white;
  transform: rotateY(180deg);
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  text-align: left;
}
</style>
