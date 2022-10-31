import { watchEffect, ref } from 'vue';

/**
 * Avoid scrolled position is in the middle of the page while opening the page
 * e.g.: https://gyazo.com/bc7672d82686c12d3c1e3dfc9604ee41
 */
export const usePageReady = () => {
  const isReady = ref<boolean>(false);

  // Memo: scrollBehavior in createRouter is not working (Vue Router)
  // Memo: this is a quick hack to achieve 'scroll to top' whenever the page is opened from dApp page
  const setIsReady = (): void => {
    setTimeout(() => {
      isReady.value = true;
    }, 100);
  };
  watchEffect(setIsReady);
  return { isReady };
};
