// Keeps track of currently selected component.
import { ref } from 'vue';

export function useSelectableComponent(selectedIndex: number | undefined = undefined) {
  const selectedComponentIndex = ref<number | undefined>(selectedIndex);

  const handleSelectComponent = (index: number) => {
    selectedComponentIndex.value = index;
  };

  const isComponentSelected = (index: number) => selectedComponentIndex.value === index;

  return {
    selectedComponentIndex,
    handleSelectComponent,
    isComponentSelected,
  };
}
