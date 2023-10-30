import { watch, computed } from 'vue';
import { useNetworkInfo } from '../../hooks/useNetworkInfo';
import { container } from 'src/v2/common';
import { IDappStakingRepository, ProtocolState } from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';

export function useDappStaking() {
  const { currentNetworkIdx } = useNetworkInfo();
  const store = useStore();

  const protocolState = computed<ProtocolState | undefined>(
    () => store.getters['stakingV3/getProtocolState']
  );

  watch(
    currentNetworkIdx,
    async () => {
      if (currentNetworkIdx) {
        const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
        const state = await stakingRepo.getProtocolState();
        store.commit('stakingV3/setProtocolState', state);
      }
    },
    { immediate: true }
  );

  return { protocolState };
}
