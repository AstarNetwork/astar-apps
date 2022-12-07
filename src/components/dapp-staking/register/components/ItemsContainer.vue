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
  border: 1px solid $gray-2;
  transition: background-color 0.5s;
  transition: border-color 0.5s;
  border-radius: 6px;
  padding: 8px 12px;
}

.body--dark {
  .items-container {
    border: 1px solid $gray-5;
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
