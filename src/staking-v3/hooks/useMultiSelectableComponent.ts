// Keeps track of currently selected component.
import { ref } from 'vue';

export function useMultiSelectableComponent(
  selectedIndex: number | undefined = undefined,
  maxItemsToSelect: number = Number.MAX_SAFE_INTEGER
) {
  const selectedIndexes = ref<number[]>(selectedIndex ? [selectedIndex] : []);

  const getSelectionOrder = (index: number): number | undefined => {
    const number = selectedIndexes.value.indexOf(index) + 1;

    return number === 0 ? undefined : number;
  };

  const handleItemSelected = (index: number): void => {
    const indexToRemove = selectedIndexes.value.indexOf(index);
    if (indexToRemove >= 0) {
      selectedIndexes.value.splice(indexToRemove, 1);
    } else {
      if (selectedIndexes.value.length < maxItemsToSelect) {
        selectedIndexes.value.push(index);
      }
    }
  };

  return {
    selectedIndexes,
    getSelectionOrder,
    handleItemSelected,
  };
}
