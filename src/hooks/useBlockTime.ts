import { computed } from 'vue';
import { useStore } from 'src/store';
import { container } from 'src/v2/common';
import { ISystemRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';

export function useBlockTime() {
  const store = useStore();
  const blockTimeInSeconds = computed<number | undefined>(
    () => store.getters['general/getBlockTimeInSeconds']
  );

  const fetchBlockTimeToStore = async () => {
    const systemRepository = container.get<ISystemRepository>(Symbols.SystemRepository);
    const blockTime = await systemRepository.getBlockTimeInSeconds();
    store.commit('general/setBlockTime', blockTime);
  };

  return { blockTimeInSeconds, fetchBlockTimeToStore };
}
