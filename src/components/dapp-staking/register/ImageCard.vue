<template>
  <div class="card">
    <div>
      <q-img v-if="base64Image" :src="base64Image" class="image" @click="emitClick" />
      <div v-else class="slot image" @click="emitClick">
        <slot></slot>
      </div>
      <q-icon v-if="canRemoveCard" name="close" class="close" @click.prevent="emitRemove" />
    </div>

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
    canRemoveCard: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click', 'remove'],
  setup(props, { emit }) {
    const emitRemove = (e: MouseEvent): void => {
      emit('remove', e);
    };

    const emitClick = (e: MouseEvent): void => {
      emit('click', e);
    };

    return {
      ...toRefs(props),
      emitRemove,
      emitClick,
    };
  },
});
</script>

<style scoped>
.card {
  width: 120px;
  position: relative;
}

.card:hover {
  display: block;
  cursor: pointer;
}

.close {
  opacity: 0;
  transition: 0.5s ease;
  border: 1px solid white;
  border-radius: 50%;
  position: absolute;
  top: 12%;
  left: 90%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  /* text-align: center; */
}

.card:hover .close {
  opacity: 1;
}

.card:hover .image {
  opacity: 0.5;
  transition: 0.5s ease;
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

.slot {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
