<template>
  <div class="card">
    <div class="card--image">
      <q-img v-if="base64Image" :src="base64Image" class="image" @click="emitClick" />
      <div v-else class="slot image" @click="emitClick">
        <slot></slot>
      </div>
      <div class="overlay"></div>
      <q-icon v-if="canRemoveCard" name="close" class="close" @click.prevent="emitRemove" />
    </div>

    <div v-if="description" class="description register-container--label">
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

<style scoped lang="scss">
@use 'src/components/dapp-staking/styles/register.scss';

.card {
  width: 120px;
  position: relative;
}

.card:hover {
  display: block;
  cursor: pointer;
}

.card--image {
  position: relative;
  border-radius: 6px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  border-radius: 6px;
  opacity: 0;
  pointer-events: none;
}

.close {
  opacity: 0;
  color: $gray-1;
  transition: 0.5s ease;
  border: 1px solid $gray-1;
  border-radius: 50%;
  position: absolute;
  top: 12%;
  left: 90%;
  transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
}

.card:hover .close {
  opacity: 1;
}

// .card:hover .image {
//   opacity: 0.8;
//   transition: 0.5s ease;
// }

.card:hover .overlay {
  opacity: 0.2;
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
