import { LOCAL_STORAGE } from 'src/config/localStorage';

export const checkIsLimitedProvider = (): boolean => {
  const limitedProvider = ['onfinality', 'blast'];
  const selectedEndpoint = JSON.parse(
    String(localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT))
  );
  const endpoint = String(Object.values(selectedEndpoint)[0]);
  let result = false;
  limitedProvider.forEach((it) => {
    const res = endpoint.includes(it);
    if (res) {
      result = true;
    }
  });
  return result;
};
