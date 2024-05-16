// Pages data to be used by Swiper component (actually any component that needs to display pages)
import { computed, Ref } from 'vue';

export function usePaging<T>(items: Ref<T[]>, itemsPerPage: number = 5) {
  const pagedItems = computed<T[][]>(() => {
    const pages = [];
    for (let i = 0; i < items.value.length; i += itemsPerPage) {
      pages.push(items.value.slice(i, i + itemsPerPage));
    }
    return pages;
  });

  return {
    pagedItems,
  };
}
