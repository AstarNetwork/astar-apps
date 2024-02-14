<template>
  <div class="wrapper--data-card">
    <div class="card--inner">
      <div class="card--front">
        <div class="card--top">
          {{ title }}
        </div>
        <div class="card--bottom">
          <slot></slot>
        </div>
      </div>
      <div class="card--back">
        <div>
          {{ description }}
          <a
            v-if="linkUrl !== '' && linkLabel !== ''"
            :href="linkUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text--link"
          >
            {{ linkLabel }}
          </a>
        </div>
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
      required: true,
    },
    linkUrl: {
      type: String,
      required: false,
      default: '',
    },
    linkLabel: {
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
@import 'src/css/quasar.variables.scss';

.wrapper--data-card {
  height: 150px;
  flex-grow: 1;
}

.card--inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.wrapper--data-card:hover .card--inner {
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
  border: 1px solid $navy-1;
  border-radius: 16px;
  padding: 24px;
  line-height: 1.25;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  background-color: white;
}

.card--top {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: flex-end;
}

.card--back {
  background-color: $navy-1;
  color: white;
  transform: rotateY(180deg);
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.card--bottom {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.text--link {
  color: $astar-blue-dark;
  &:hover {
    color: lighten($astar-blue-dark, 15%);
  }
}
</style>
