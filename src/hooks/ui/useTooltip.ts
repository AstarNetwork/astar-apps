import { computed, ref } from 'vue';
import { isMobileDevice } from '../helper/wallet';

/**
 * Make the improved tooltips for smartphone, so the tooltips won't be removed once the user release the button
 * @param className -> class name for the hover icon class
 */
export const useTooltip = (className: string) => {
  const isMobileDisplayTooltip = ref<boolean>(false);

  const isDisplayTooltip = computed<boolean | null>(() => {
    if (isMobileDevice) {
      return isMobileDisplayTooltip.value;
    } else {
      return null;
    }
  });

  const setIsMobileDisplayTooltip = (e: { target: { className: string } }): void => {
    if (isMobileDevice) {
      const isOpen = e.target.className.includes(className);
      isMobileDisplayTooltip.value = isOpen;
    }
  };

  return { setIsMobileDisplayTooltip, isDisplayTooltip };
};
