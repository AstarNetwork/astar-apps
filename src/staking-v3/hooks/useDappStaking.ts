import { $api } from 'boot/api';
import { computed } from 'vue';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import { container } from 'src/v2/common';
import {
  AccountLedger,
  Constants,
  DAppTierRewards,
  DappInfo,
  DappStakeInfo,
  EraInfo,
  IDappStakingRepository,
  IDappStakingService,
  PeriodType,
  ProtocolState,
  Rewards,
  SingularStakingInfo,
  TiersConfiguration,
} from '../logic';
import { Symbols } from 'src/v2/symbols';
import { useStore } from 'src/store';
import { useAccount, useChainMetadata, useBalance } from 'src/hooks';
import { useI18n } from 'vue-i18n';
import { useDapps } from './useDapps';
import { ethers } from 'ethers';

import BN from 'bn.js';
import { initialDappTiersConfiguration, initialTiersConfiguration } from '../store/state';
import { checkIsDappStakingV3 } from 'src/modules/dapp-staking';
import { ApiPromise } from '@polkadot/api';

export function useDappStaking() {
  const { t } = useI18n();
  const store = useStore();
  const { currentAccount } = useAccount();
  const { registeredDapps, fetchStakeAmountsToStore } = useDapps();
  const { decimal } = useChainMetadata();
  const { useableBalance } = useBalance(currentAccount);

  const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);

  const isDappStakingV3 = computed<boolean>(() => {
    return checkIsDappStakingV3($api as ApiPromise);
  });

  const protocolState = computed<ProtocolState | undefined>(
    () => store.getters['stakingV3/getProtocolState']
  );

  const isVotingPeriod = computed<boolean>(
    () => protocolState.value?.periodInfo.subperiod === PeriodType.Voting
  );

  const ledger = computed<AccountLedger | undefined>(() => store.getters['stakingV3/getLedger']);

  const rewards = computed<Rewards>(() => {
    const rewards = store.getters['stakingV3/getRewards'];
    if (!rewards) {
      getAllRewards();
    }

    return (
      rewards ?? {
        dApp: BigInt(0),
        staker: BigInt(0),
        bonus: BigInt(0),
      }
    );
  });

  const totalStakerRewards = computed<BigInt>(() => rewards.value.staker + rewards.value.bonus);

  const constants = computed<Constants | undefined>(() => {
    const consts = store.getters['stakingV3/getConstants'];
    if (!consts) {
      fetchConstantsToStore();
    }

    return consts;
  });

  const currentEraInfo = computed<EraInfo | undefined>(() => {
    const era = store.getters['stakingV3/getCurrentEraInfo'];
    if (!era) {
      getCurrentEraInfo();
    }

    return era;
  });

  const dAppTiers = computed<DAppTierRewards>(() => {
    const tiers = store.getters['stakingV3/getDappTiers'];
    if (!tiers) {
      const era = protocolState.value?.era;
      getDappTiers(era ? era - 1 : 0);
    }

    return tiers ?? initialDappTiersConfiguration;
  });

  const stakerInfo = computed<Map<string, SingularStakingInfo>>(
    () => store.getters['stakingV3/getStakeInfo']
  );

  const tiersConfiguration = computed<TiersConfiguration>(
    () => store.getters['stakingV3/getTiersConfiguration'] ?? initialTiersConfiguration
  );

  const isCurrentPeriod = (period: number): boolean =>
    protocolState.value?.periodInfo.number === period;

  const hasStakerRewards = computed<boolean>(() => !!rewards.value.staker);
  const hasDappRewards = computed<boolean>(() => !!rewards.value.dApp);
  const hasBonusRewards = computed<boolean>(() => !!rewards.value.bonus);
  const hasRewards = computed<boolean>(
    () => hasStakerRewards.value || hasDappRewards.value || hasBonusRewards.value
  );

  const totalStake = computed<bigint>(() => {
    let result = BigInt(0);

    if (ledger.value?.stakedFuture && isCurrentPeriod(ledger.value.stakedFuture.period)) {
      result += !isRewardOrStakeExpired(ledger.value.stakedFuture.period)
        ? ledger.value.stakedFuture.voting + ledger.value.stakedFuture.buildAndEarn
        : BigInt(0);
    } else if (ledger.value && isCurrentPeriod(ledger.value.staked.period)) {
      result += !isRewardOrStakeExpired(ledger.value.staked.period)
        ? ledger.value.staked.voting + ledger.value.staked.buildAndEarn
        : BigInt(0);
    }

    return result;
  });

  const isRewardOrStakeExpired = (period: number): boolean =>
    protocolState.value && constants.value
      ? protocolState.value.periodInfo.number < period - constants.value.rewardRetentionInPeriods
      : true;

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

  const unstake = async (dapp: DappInfo, amount: number): Promise<void> => {
    const [result, error] = await canUnStake(dapp.address, amount);
    if (!result) {
      throw error;
    }

    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimUnstakeAndUnlock(
      dapp.address,
      amount,
      currentAccount.value,
      'success'
    );
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    const bonus = await stakingService.getBonusRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker, bonus });
    fetchStakerInfoToStore();
    getCurrentEraInfo();
    // fetchStakeAmountsToStore([dapp.id]);
    fetchStakeAmountsToStore();
  };

  const claimStakerRewards = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimStakerRewards(currentAccount.value, 'success');
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker });
  };

  const claimLockAndStake = async (
    stakeInfo: DappStakeInfo[],
    lockAmount: bigint
  ): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);

    await stakingService.claimLockAndStake(
      currentAccount.value,
      Number(ethers.utils.formatEther(lockAmount.toString())),
      stakeInfo
    );
    await Promise.all([
      getAllRewards(),
      fetchStakerInfoToStore(),
      // fetchStakeAmountsToStore(stakeInfo.map((x) => x.id)),
      fetchStakeAmountsToStore(),
      getCurrentEraInfo(),
    ]);
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

  const claimStakerAndBonusRewards = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimStakerAndBonusRewards(currentAccount.value, 'success');
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    const bonus = await stakingService.getBonusRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker, bonus });
  };

  const withdraw = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.claimUnlockedTokens(currentAccount.value);
    getCurrentEraInfo();
  };

  const relock = async (): Promise<void> => {
    const stakingService = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
    await stakingService.relockUnlockingTokens(currentAccount.value);
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

  const fetchConstantsToStore = async (): Promise<void> => {
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const constants = await stakingRepo.getConstants();
    constants.minStakeAmountToken = Number(
      (constants.minStakeAmount ?? 0) / BigInt(10 ** decimal.value)
    );
    store.commit('stakingV3/setConstants', constants);
  };

  const getCurrentEraInfo = async (): Promise<void> => {
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const eraInfo = await stakingRepo.getCurrentEraInfo();

    store.commit('stakingV3/setCurrentEraInfo', eraInfo);
  };

  const canStake = async (amount: number): Promise<[boolean, string]> => {
    const stakeAmount = new BN(ethers.utils.parseEther(amount.toString()).toString());
    const balanceBN = new BN(useableBalance.value.toString());
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const constants = await stakingRepo.getConstants();

    if (amount <= 0) {
      // Prevents dappStaking.ZeroAmount
      return [false, t('stakingV3.dappStaking.ZeroAmount')];
    } else if ((ledger.value?.contractStakeCount ?? 0) >= constants.maxNumberOfStakedContracts) {
      // Prevents dappStaking.TooManyStakedContracts
      return [false, t('stakingV3.dappStaking.TooManyStakedContracts')];
    } else if (hasRewards.value) {
      // Prevents dappStaking.UnclaimedRewardsFromPastPeriods
      // May want to auto claim rewards here
      return [false, t('stakingV3.dappStaking.UnclaimedRewardsFromPastPeriods')];
    } else if (protocolState.value?.maintenance) {
      // Prevents dappStaking.Disabled
      return [false, t('stakingV3.dappStaking.Disabled')];
    } else if (stakeAmount.gt(balanceBN)) {
      // Prevents dappStaking.UnavailableStakeFunds
      return [false, t('stakingV3.dappStaking.UnavailableStakeFunds')];
    } else if (
      // Prevents dappStaking.PeriodEndsInNextEra
      protocolState.value?.periodInfo.subperiod === PeriodType.BuildAndEarn &&
      protocolState.value.periodInfo.subperiodEndEra <= protocolState.value.era + 1
    ) {
      return [false, t('stakingV3.dappStaking.PeriodEndsNextEra')];
    }

    return [true, ''];
  };

  const canUnStake = async (address: string, amount: number): Promise<[boolean, string]> => {
    const stakeAmount = new BN(ethers.utils.parseEther(amount.toString()).toString());
    const stakedAmount = new BN(ledger.value?.locked?.toString() ?? 0);

    if (amount <= 0) {
      // Prevents dappStaking.ZeroAmount
      return [false, t('stakingV3.dappStaking.ZeroAmount')];
    } else if (stakeAmount.gt(stakedAmount)) {
      // Prevents dappStaking.UnstakeAmountTooLarge
      return [false, t('stakingV3.dappStaking.UnstakeAmountTooLarge')];
    } else if (protocolState.value?.maintenance) {
      // Prevents dappStaking.Disabled
      return [false, t('stakingV3.dappStaking.Disabled')];
    } else if (!address) {
      // Prevents dappStaking.NoStakingInfo
      return [false, t('stakingV3.dappStaking.NoStakingInfo')];
    } else if (!amount) {
      // Prevents dappStaking.UnstakeFromPastPeriod
      return [false, t('stakingV3.dappStaking.UnstakeFromPastPeriod')];
    }

    return [true, ''];
  };

  const getDappTiers = async (era: number): Promise<void> => {
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const tiers = await stakingRepo.getDappTiers(era);

    store.commit('stakingV3/setDappTiers', tiers);
  };

  const getDappTier = (dappId: number): number | undefined => {
    const tierId = dAppTiers.value?.dapps.find((x) => x.dappId === dappId)?.tierId;

    return tierId !== undefined ? tierId + 1 : undefined;
  };

  const fetchStakerInfoToStore = async (): Promise<void> => {
    if (!currentAccount.value) {
      return;
    }

    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const stakerInfo = await stakingRepo.getStakerInfo(currentAccount.value, false);

    store.commit('stakingV3/setStakerInfo', stakerInfo, { root: true });
  };

  const fetchTiersConfigurationToStore = async (): Promise<void> => {
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const tiersConfiguration = await stakingRepo.getTiersConfiguration();

    store.commit('stakingV3/setTiersConfiguration', tiersConfiguration);
  };

  return {
    protocolState,
    ledger,
    rewards,
    constants,
    totalStake,
    hasStakerRewards,
    hasDappRewards,
    hasBonusRewards,
    hasRewards,
    currentEraInfo,
    dAppTiers,
    isVotingPeriod,
    isDappStakingV3,
    stakerInfo,
    tiersConfiguration,
    totalStakerRewards,
    currentBlock,
    isCurrentPeriod,
    stake,
    unstake,
    claimStakerRewards,
    canStake,
    canUnStake,
    claimDappRewards,
    claimBonusRewards,
    claimStakerAndBonusRewards,
    getAllRewards,
    fetchConstantsToStore,
    claimLockAndStake,
    getCurrentEraInfo,
    getDappTiers,
    getDappTier,
    fetchStakerInfoToStore,
    fetchTiersConfigurationToStore,
    withdraw,
    relock,
  };
}
