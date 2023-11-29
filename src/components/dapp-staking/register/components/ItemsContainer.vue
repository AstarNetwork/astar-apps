<template>
  <div>
    <div class="items-container">
      <div v-if="title" class="register-container--label">{{ title }}</div>
      <slot></slot>
    </div>
    <div class="error">{{ validationError }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    validationError: {
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
@use 'src/components/assets/styles/assets.scss';
@use '../styles/register.scss';

.items-container {
  border: 1px solid transparent;
  transition: border-color 0.3s;
  border-radius: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 0px 24px 4px rgba(0, 0, 0, 0.08);
  &:hover {
    border-color: $astar-blue;
  }
}

.body--dark {
  .items-container {
    background: $navy-1;
    border-color: $gray-5;
  }
}

.items-container:hover {
  border-color: $astar-blue;
}

.container.div {
  cursor: pointer;
}

.error {
  padding-left: 12px;
  padding-top: 8px;
  font-size: 12px;
  color: var(--q-negative);
}
</style>
