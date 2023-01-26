import { fadeDuration } from '@astar-network/astar-ui';
import { wait } from 'src/v2/common';
import { ref, watchEffect } from 'vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';

const { BALLOON_NATIVE_TOKEN } = LOCAL_STORAGE;

export const useBalloons = () => {
  const isBalloonNativeToken = ref<boolean>(false);
  const isBalloonNativeTokenClosing = ref<boolean>(false);

  const handleCloseNativeTokenBalloon = async (): Promise<void> => {
    isBalloonNativeTokenClosing.value = true;
    await wait(fadeDuration * 2);
    isBalloonNativeTokenClosing.value = false;
    isBalloonNativeToken.value = false;
    localStorage.setItem(BALLOON_NATIVE_TOKEN, 'false');
  };

  const initIsBalloonNativeToken = async (): Promise<void> => {
    const delay = 2 * 1000;
    await wait(delay);
    isBalloonNativeToken.value = localStorage.getItem(BALLOON_NATIVE_TOKEN) !== 'false';
    // isBalloonNativeToken.value = true;
  };

  watchEffect(initIsBalloonNativeToken);

  return { isBalloonNativeToken, isBalloonNativeTokenClosing, handleCloseNativeTokenBalloon };
};
