<template>
  <div class="card">
    <img v-if="base64Image" :src="base64Image" class="image" />
    <slot v-else></slot>
    <div v-if="description" class="description">
      {{ description }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    base64Image: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    console.log('card ', props);
    return {
      ...toRefs(props),
    };
  },
});
</script>

<style scoped>
.card {
  width: 120px;
}
.description {
  width: 120px;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-top: 8px;
  font-size: 12px;
}

.image {
  border-radius: 6px;
  width: 120px;
  height: 80px;
}
</style>
