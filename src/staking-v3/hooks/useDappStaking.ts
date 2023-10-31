import { watch, computed } from 'vue';
import { useNetworkInfo } from '../../hooks/useNetworkInfo';
import { container } from 'src/v2/common';
import { IDappStakingRepository, IDappStakingService, ProtocolState } from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';
import { useAccount } from 'src/hooks';

export function useDappStaking() {
  const { currentNetworkIdx } = useNetworkInfo();
  const store = useStore();
  const { currentAccount } = useAccount();

  const protocolState = computed<ProtocolState | undefined>(
    () => store.getters['stakingV3/getProtocolState']
  );

  const stake = async (dappAddress: string, amount: number): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.lockAndStake(dappAddress, amount, currentAccount.value, 'success');
  };

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

  return { protocolState, stake };
}
