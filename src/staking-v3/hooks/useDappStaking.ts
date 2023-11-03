import { watch, computed } from 'vue';
import { useNetworkInfo } from '../../hooks/useNetworkInfo';
import { container } from 'src/v2/common';
import {
  AccountLedger,
  IDappStakingRepository,
  IDappStakingService,
  PeriodType,
  ProtocolState,
} from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';
import { useAccount } from 'src/hooks';
import { useI18n } from 'vue-i18n';

export function useDappStaking() {
  const { t } = useI18n();
  const { currentNetworkIdx } = useNetworkInfo();
  const store = useStore();
  const { currentAccount } = useAccount();

  const protocolState = computed<ProtocolState | undefined>(
    () => store.getters['stakingV3/getProtocolState']
  );

  const ledger = computed<AccountLedger | undefined>(() => store.getters['stakingV3/getLedger']);

  const stake = async (dappAddress: string, amount: number): Promise<void> => {
    const [result, error] = canStake(amount);
    if (!result) {
      throw error;
    }

    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.lockAndStake(dappAddress, amount, currentAccount.value, 'success');
  };

  const unstake = async (dappAddress: string, amount: number): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.unstakeAndUnlock(dappAddress, amount, currentAccount.value, 'success');
  };

  const claimStakerRewards = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimStakerRewards(currentAccount.value, 'success');
  };

  const canStake = (amount: number): [boolean, string] => {
    if (amount <= 0) {
      return [false, t('stakingV3.amountGreater0')];
    } else if (
      protocolState.value?.periodInfo.type === PeriodType.BuildAndEarn &&
      protocolState.value.periodInfo.endingEra <= protocolState.value.era + 1
    ) {
      return [false, t('stakingV3.periodEndsNextEra')];
    }

    return [true, ''];
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

  return { protocolState, ledger, stake, unstake, claimStakerRewards, canStake };
}
