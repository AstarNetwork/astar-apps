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
    decimal: 12,
    defaultUnitToken: '',
  });

  watchEffect(() => {
    const registry = api?.value?.registry;

    const decimals = registry?.chainDecimals;
    const tokens = registry?.chainTokens;

    state.decimal = (decimals || [])[0];
    state.defaultUnitToken = (tokens || [])[0];

    setDefaultUnitName(state.defaultUnitToken);
  });

  return toRefs(state);
};
