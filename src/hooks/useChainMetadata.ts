import { LOCAL_STORAGE } from './../config/localStorage';
import { toRefs, reactive, watchEffect } from 'vue';
import { useApi } from '.';
import { setDefaultUnitName } from './helper/units';

interface Metadata {
  decimal: number;
  defaultUnitToken: string;
}

export const useChainMetadata = () => {
  const { api } = useApi();

  const state = reactive<Metadata>({
    decimal: 18,
    defaultUnitToken: '',
  });

  // Memo: Separate the watchEffect due to useApi returns decimal:12 at the very first moment if without `isReady`
  watchEffect(() => {
    if (!api || !api.value) return;

    api.value.isReady.then(() => {
      const registry = api.value!.registry;
      const decimals = registry.chainDecimals;
      state.decimal = (decimals || [])[0];
    });
  });

  watchEffect(() => {
    if (!api || !api.value) return;

    const tokens = api.value!.registry.chainTokens;
    // Memo: Always set from blank array if with `isReady`
    state.defaultUnitToken = (tokens || [])[0];
    setDefaultUnitName(state.defaultUnitToken);
    localStorage.setItem(LOCAL_STORAGE.DEFAULT_CURRENCY, state.defaultUnitToken);
  });

  return toRefs(state);
};
