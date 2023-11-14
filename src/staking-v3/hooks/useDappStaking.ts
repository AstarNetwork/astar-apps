import { watch, computed } from 'vue';
import { useNetworkInfo } from '../../hooks/useNetworkInfo';
import { container } from 'src/v2/common';
import {
  AccountLedger,
  IDappStakingRepository,
  IDappStakingService,
  PeriodType,
  ProtocolState,
  Rewards,
} from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';
import { useAccount } from 'src/hooks';
import { useI18n } from 'vue-i18n';
import { useDapps } from './useDapps';

export function useDappStaking() {
  const { t } = useI18n();
  const { currentNetworkIdx } = useNetworkInfo();
  const store = useStore();
  const { currentAccount } = useAccount();
  const { registeredDapps } = useDapps();

  const protocolState = computed<ProtocolState | undefined>(
    () => store.getters['stakingV3/getProtocolState']
  );
  const ledger = computed<AccountLedger | undefined>(() => store.getters['stakingV3/getLedger']);
  const rewards = computed<Rewards | undefined>(() => store.getters['stakingV3/getRewards']);

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
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker });
  };

  const claimBonusRewards = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimBonusRewards(currentAccount.value, 'success');
    const bonus = await stakingService.getBonusRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, bonus });
  };

  const claimDappRewards = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    const contractAddress = getOwnedDappAddress();

    if (contractAddress) {
      await stakingService.claimDappRewards(contractAddress, currentAccount.value, 'success');
      const dApp = await stakingService.getDappRewards(contractAddress);
      store.commit('stakingV3/setRewards', { ...rewards.value, dApp });
    } else {
      throw 'No dapp found';
    }
  };

  const getAllRewards = async (): Promise<void> => {
    const stakingV3service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    const ownedContractAddress = getOwnedDappAddress();

    const calls = [];
    if (currentAccount.value) {
      calls.push(stakingV3service.getStakerRewards(currentAccount.value));
      calls.push(stakingV3service.getBonusRewards(currentAccount.value));
    }
    if (ownedContractAddress) {
      calls.push(stakingV3service.getDappRewards(ownedContractAddress));
    }

    const [staker, dApp, bonus] = await Promise.all(calls);
    store.commit('stakingV3/setRewards', { staker, dApp, bonus }, { root: true });
  };

  const getOwnedDappAddress = (): string | undefined => {
    return registeredDapps.value.find(
      (x) =>
        x.chain.rewardDestination === currentAccount.value || x.chain.owner === currentAccount.value
    )?.chain.address;
  };

  const canStake = (amount: number): [boolean, string] => {
    if (amount <= 0) {
      return [false, t('stakingV3.amountGreater0')];
    } else if (
      protocolState.value?.periodInfo.subperiod === PeriodType.BuildAndEarn &&
      protocolState.value.periodInfo.subperiodEndEra <= protocolState.value.era + 1
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

  return {
    protocolState,
    ledger,
    rewards,
    stake,
    unstake,
    claimStakerRewards,
    canStake,
    claimDappRewards,
    claimBonusRewards,
    getAllRewards,
  };
}
