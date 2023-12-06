<template>
  <div class="wrapper--buttons">
    <div
      v-for="(caption, index) in captions"
      :key="index"
      :class="selectedButtonIndex === index ? 'button button--selected' : ''"
      class="button"
      @click="handleButtonSelected(index)"
    >
      {{ caption }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    captions: {
      type: Array<String>,
      required: true,
    },
  },
  emits: ['buttonSelected'],
  setup(_props, { emit }) {
    const selectedButtonIndex = ref<number>(0);

    const handleButtonSelected = (index: number) => {
      selectedButtonIndex.value = index;
      emit('buttonSelected', index);
    }

    return { selectedButtonIndex, handleButtonSelected };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--buttons {
  display: inline-flex;
  padding: 8px;
  border: 1px solid $gray-2;
  border-radius: 80px;
  gap: 4px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 24px;
}

.button {
  height: 54px;
  border-radius: 27px;
  padding: 0 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover {
    background-color: $gray-1;
  }
}

.button--selected {
  background-color: $navy-1;
  color: $white;
  cursor: default;
  transition: all 0.2s ease;
  &:hover {
    background-color: $navy-1;
  }
}

.body--dark {
  .wrapper--buttons {
    border-color: $gray-4;
  }
  .button {
    &:hover {
      background-color: $navy-4;
    }
  }
  .button--selected {
    background-color: $gray-1;
    color: $navy-1;
    &:hover {
      background-color: $gray-1;
    }
  }
}
</style>
