<template>
  <div class="header">
    <div class="header-left">
      <div v-if="title">{{ title }}</div>
      <div v-else>
        <slot name="left"></slot>
      </div>
    </div>
    <div class="header-right">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  name: 'HeaderComp',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.header {
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  height: 6rem;
  padding: 1.25rem 0.625rem;
  // background: $gray-1;
  mix-blend-mode: normal;
  backdrop-filter: blur(200px);
  border-bottom: 1px solid $gray-3;
  @supports (-moz-appearance: none) {
    background: $backdrop-transparent-dark-firefox !important;
  }
  @media (min-width: $lg) {
    padding-left: 28px;
    padding-right: 28px;
  }
}

.header-left {
  display: flex;
  height: 100%;
  align-items: center;
  font-weight: 590;
  font-size: 1.625rem;
  padding: 0.75rem;
  color: $gray-5-selected;
}

.header-right {
  display: flex;
  height: 100%;
  align-items: center;
  padding: 0.75rem;
}

.body--dark {
  .header {
    // background: $gray-6;
    background: transparent !important;
    border-bottom: 1px solid $gray-6;
  }
  .header-left {
    color: $gray-1;
  }
}

@media screen and (max-width: 1024px) {
  .header {
    height: 4rem;
    padding: 0.5rem 1rem;
    padding-left: 20px;
    padding-right: 16px;
  }

  .header-left {
    padding: 0rem;
  }

  .header-right {
    padding: 0rem;
  }
}
</style>
