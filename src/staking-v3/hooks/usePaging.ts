// Pages data to be used by Swiper component (actually any component that needs to display pages)
import { computed } from 'vue';

export function usePaging<T>(items: T[], itemsPerPage: number = 5) {
  const pagedItems = computed<T[][]>(() => {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }
    return pages;
  });

  return {
    pagedItems,
  };
}
