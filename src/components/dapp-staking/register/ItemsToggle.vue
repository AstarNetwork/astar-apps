<template>
  <div class="items--container">
    <div
      v-for="(item, index) in availableItems"
      :key="index"
      :class="['toggle', isChecked(item.value) ? 'toggle-checked' : '']"
      @click="togglePlatform(item.value)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from 'vue';

export interface LabelValuePair {
  label: string;
  value: string;
}

export default defineComponent({
  props: {
    availableItems: {
      type: Object as PropType<LabelValuePair[]>,
      required: true,
    },
    itemToggled: {
      type: Function,
      required: true,
    },
    allowMultiselect: {
      type: Boolean,
      default: true,
    },
    selectedItems: {
      type: Array as PropType<string[]>,
      default: null,
    },
  },
  setup(props) {
    const selectedItems = ref<string[]>(props.selectedItems ? props.selectedItems : []);

    const togglePlatform = (value: string): void => {
      if (props.allowMultiselect) {
        const index = selectedItems.value.findIndex((x) => x === value);
        if (index > -1) {
          selectedItems.value.splice(index, 1);
        } else {
          selectedItems.value.push(value);
        }
      } else {
        selectedItems.value = [value];
      }

      props.itemToggled && props.itemToggled(selectedItems.value);
    };

    const isChecked = (value: string): boolean => {
      return selectedItems.value.findIndex((x) => x === value) > -1;
    };

    return {
      togglePlatform,
      isChecked,
    };
  },
});
</script>

<style lang="scss" scoped>
.toggle {
  margin-right: 10px;
  padding-top: 5px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  background-color: #e6e9ee;
}

.items--container {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}

.toggle-checked {
  background-color: $astar-blue;
}

.body--dark {
  .toggle {
    background-color: $gray-5-selected;
  }

  .toggle-checked {
    background-color: $astar-blue;
  }
}
</style>
