import { watch, computed } from 'vue';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
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
import { useAccount, useBalance } from 'src/hooks';
import { useI18n } from 'vue-i18n';
import { useDapps } from './useDapps';
import { ethers } from 'ethers';
import BN from 'bn.js';

export function useDappStaking() {
  const { t } = useI18n();
  const { currentNetworkIdx } = useNetworkInfo();
  const store = useStore();
  const { currentAccount } = useAccount();
  const { registeredDapps } = useDapps();

  const { balance, isLoadingBalance } = useBalance(currentAccount);

  const protocolState = computed<ProtocolState | undefined>(
    () => store.getters['stakingV3/getProtocolState']
  );
  const ledger = computed<AccountLedger | undefined>(() => store.getters['stakingV3/getLedger']);
  const rewards = computed<Rewards | undefined>(() => store.getters['stakingV3/getRewards']);

  const stake = async (dappAddress: string, amount: number): Promise<void> => {
    const [result, error] = await canStake(amount);
    if (!result) {
      throw error;
    }

    const successMessage = t('stakingV3.successfullyStaked', {
      contractAddress: getShortenAddress(dappAddress, 5),
    });
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.lockAndStake(dappAddress, amount, currentAccount.value, successMessage);
  };

  const unstake = async (dappAddress: string, amount: number): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.unstakeAndUnlock(dappAddress, amount, currentAccount.value, 'success');
  };

  const canClaimStakerRewards = (): boolean => (rewards.value?.staker ?? 0) > BigInt(0);

  const claimStakerRewards = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimStakerRewards(currentAccount.value, 'success');
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker });
  };

  const canClaimBonusRewards = (): boolean => (rewards.value?.bonus ?? 0) > BigInt(0);

  const claimBonusRewards = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimBonusRewards(currentAccount.value, 'success');
    const bonus = await stakingService.getBonusRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, bonus });
  };

  const canClaimDappRewards = (): boolean => (rewards.value?.dApp ?? 0) > BigInt(0);

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

    let staker = BigInt(0);
    let dApp = BigInt(0);
    let bonus = BigInt(0);

    if (currentAccount.value) {
      staker = await stakingV3service.getStakerRewards(currentAccount.value);
      bonus = await stakingV3service.getBonusRewards(currentAccount.value);

      if (ownedContractAddress) {
        dApp = await stakingV3service.getDappRewards(ownedContractAddress ?? '');
      }
    }

    store.commit('stakingV3/setRewards', { staker, dApp, bonus }, { root: true });
  };

  const getOwnedDappAddress = (): string | undefined => {
    return registeredDapps.value.find(
      (x) =>
        x.chain.rewardDestination === currentAccount.value || x.chain.owner === currentAccount.value
    )?.chain.address;
  };

  const canStake = async (amount: number): Promise<[boolean, string]> => {
    const stakeAmount = new BN(ethers.utils.parseEther(amount.toString()).toString());
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const constants = await stakingRepo.getConstants();

    if (amount <= 0) {
      // Prevents ZeroAmount
      return [false, t('stakingV3.amountGreater0')];
    } else if ((ledger.value?.contractStakeCount ?? 0) >= constants.maxNumberOfStakedContracts) {
      // Prevents TooManyStakedContracts
      return [false, t('stakingV3.tooManyStakedContracts')];
    } else if (canClaimDappRewards()) {
      // Prevents UnclaimedRewardsFromPastPeriods
      // May want to auto claim rewards here
      return [false, t('stakingV3.unclaimedRewardsFromPastPeriods')];
    } else if (stakeAmount.gt(balance.value)) {
      // Prevents UnavailableStakeFunds
      return [false, t('stakingV3.unavailableStakeFunds')];
    } else if (
      // Prevents PeriodEndsInNextEra
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
    canClaimBonusRewards,
    canClaimDappRewards,
    canClaimStakerRewards,
  };
}
