<template>
  <div class="card">
    <img :src="base64Image" fit="cover" class="image" />
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
