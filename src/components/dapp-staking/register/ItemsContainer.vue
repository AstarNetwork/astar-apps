<template>
  <div class="container items-container">
    <div v-if="title" class="register-container--label">{{ title }}</div>
    <slot></slot>
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
@use 'src/components/dapp-staking/styles/register.scss';

.container {
  padding-left: 12px;
}

.items-container {
  transition: background-color 0.5s;
}

.items-container:hover {
  // background-color: $gray-3;
}

.container.div {
  cursor: pointer;
}
</style>
