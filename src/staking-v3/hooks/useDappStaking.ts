import { $api } from 'boot/api';
import { computed } from 'vue';
import { container } from 'src/v2/common';
import {
  AccountLedger,
  CombinedDappInfo,
  Constants,
  DAppTierRewards,
  DappStakeInfo,
  EraInfo,
  EraLengths,
  IDappStakingRepository,
  IDappStakingService,
  PeriodType,
  ProtocolState,
  Rewards,
  SingularStakingInfo,
  TiersConfiguration,
} from '../logic';
import { Symbols } from 'src/v2/symbols';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { useStore } from 'src/store';
import { useAccount, useChainMetadata, useBalance } from 'src/hooks';
import { useI18n } from 'vue-i18n';
import { useDapps } from './useDapps';
import { ethers } from 'ethers';

import { initialDappTiersConfiguration, initialTiersConfiguration } from '../store/state';
import { checkIsDappStakingV3 } from 'src/modules/dapp-staking';
import { ApiPromise } from '@polkadot/api';

export interface RewardsPerPeriod {
  period: number;
  rewards: bigint;
  erasToReward: number;
}

export function useDappStaking() {
  const { t } = useI18n();
  const store = useStore();
  const { currentAccount } = useAccount();
  const { registeredDapps, fetchStakeAmountsToStore, getDapp } = useDapps();
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

  const eraLengths = computed<EraLengths>(() => {
    const lengths = store.getters['stakingV3/getEraLengths'];
    if (!lengths) {
      fetchEraLengthsToStore();
    }

    return lengths;
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
    } else if (tiers.period === protocolState.value?.periodInfo.number) {
      return tiers;
    }

    return initialDappTiersConfiguration;
  });

  const stakerInfo = computed<Map<string, SingularStakingInfo>>(
    () => store.getters['stakingV3/getStakeInfo']
  );

  const tiersConfiguration = computed<TiersConfiguration>(
    () => store.getters['stakingV3/getTiersConfiguration'] ?? initialTiersConfiguration
  );

  const isCurrentPeriod = (period: number): boolean =>
    protocolState.value?.periodInfo.number === period;

  const rewardExpiresInNextPeriod = (period: number): boolean =>
    period == protocolState.value!.periodInfo.number - constants.value!.rewardRetentionInPeriods;

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
        ? ledger.value.stakedFuture.totalStake
        : BigInt(0);
    } else if (ledger.value && isCurrentPeriod(ledger.value.staked.period)) {
      result += !isRewardOrStakeExpired(ledger.value.staked.period)
        ? ledger.value.staked.totalStake
        : BigInt(0);
    }

    return result;
  });

  const isRewardOrStakeExpired = (period: number): boolean =>
    protocolState.value && constants.value
      ? protocolState.value.periodInfo.number < period - constants.value.rewardRetentionInPeriods
      : true;

  const unstake = async (dapp: CombinedDappInfo, amount: number): Promise<void> => {
    // TODO check implementation canStake, canUnstake
    // const [result, error] = await canUnStake(dapp.chain.address, amount);
    // if (!result) {
    //   popError(error);
    //   return;
    // }

    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    await stakingService.claimUnstakeAndUnlock(
      dapp.chain.address,
      amount,
      currentAccount.value,
      t('stakingV3.unbondSuccess', { dapp: dapp.basic.name })
    );
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    const bonus = await stakingService.getBonusRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker, bonus });
    fetchStakerInfoToStore();
    getCurrentEraInfo();
    fetchStakeAmountsToStore();
  };

  const unstakeFromUnregistered = async (dappAddress: string, dappName: string): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    await stakingService.claimAllAndUnstakeFromUnregistered(
      currentAccount.value,
      dappAddress,
      t('stakingV3.unbondFromUnregisteredSuccess', { dapp: dappName })
    );

    const [staker, bonus, dApp] = await Promise.all([
      stakingService.getStakerRewards(currentAccount.value),
      stakingService.getBonusRewards(currentAccount.value),
      stakingService.getDappRewards(dappAddress),
    ]);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker, bonus, dApp });
    fetchStakerInfoToStore();
    getCurrentEraInfo();
    fetchStakeAmountsToStore();
  };

  const claimStakerRewards = async (): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    await stakingService.claimStakerRewards(currentAccount.value, 'success');
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker });
  };

  const claimLockAndStake = async (
    stakeInfo: DappStakeInfo[],
    lockAmount: bigint,
    unstakeFromAddress: string,
    unstakeAmount: bigint
  ): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();

    await stakingService.claimLockAndStake(
      currentAccount.value,
      lockAmount,
      stakeInfo,
      unstakeFromAddress,
      unstakeAmount,
      t('stakingV3.voteSuccess', { number: stakeInfo.length })
    );
    await Promise.all([
      getAllRewards(),
      fetchStakerInfoToStore(),
      fetchStakeAmountsToStore(),
      getCurrentEraInfo(),
    ]);
  };

  const claimBonusRewards = async (): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();

    await stakingService.claimBonusRewards(currentAccount.value, 'success');
    const bonus = await stakingService.getBonusRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, bonus });
  };

  const claimDappRewards = async (contractAddress: string): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    if (contractAddress) {
      await stakingService.claimDappRewards(contractAddress, currentAccount.value, 'success');
      const dApp = await stakingService.getDappRewards(contractAddress);
      store.commit('stakingV3/setRewards', { ...rewards.value, dApp });
    } else {
      throw 'No dapp found';
    }
  };

  const claimStakerAndBonusRewards = async (): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();

    await stakingService.claimStakerAndBonusRewards(
      currentAccount.value,
      t('stakingV3.claimRewardSuccess')
    );
    const staker = await stakingService.getStakerRewards(currentAccount.value);
    const bonus = await stakingService.getBonusRewards(currentAccount.value);
    store.commit('stakingV3/setRewards', { ...rewards.value, staker, bonus });
  };

  const withdraw = async (): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    await stakingService.claimUnlockedTokens(currentAccount.value, t('stakingV3.withdrawSuccess'));
    getCurrentEraInfo();
  };

  const relock = async (): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    await stakingService.relockUnlockingTokens(currentAccount.value, t('stakingV3.relockSuccess'));
  };

  const unlock = async (amount: bigint): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    await stakingService.unlockTokens(
      currentAccount.value,
      Number(ethers.utils.formatEther(amount)),
      t('stakingV3.relockSuccess')
    );
  };

  const getAllRewards = async (): Promise<void> => {
    const stakingV3service = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
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

  const getDappRewards = async (contractAddress: string): Promise<bigint> => {
    const stakingV3service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);

    return await stakingV3service.getDappRewards(contractAddress ?? '');
  };

  const getUnclaimedDappRewardsPerPeriod = async (
    contractAddress: string
  ): Promise<RewardsPerPeriod[]> => {
    const result: RewardsPerPeriod[] = [];

    if (protocolState.value && constants.value) {
      const stakingV3service = container.get<IDappStakingService>(Symbols.DappStakingServiceV3);
      const currentPeriod = protocolState.value.periodInfo.number;
      for (
        let period = currentPeriod;
        period >= Math.max(currentPeriod - constants.value.rewardRetentionInPeriods, 1);
        period--
      ) {
        const rewards = await stakingV3service.getDappRewardsForPeriod(contractAddress, period);
        result.push({ period, rewards: rewards[0], erasToReward: rewards[1] });
      }
    }

    return result;
  };

  const getOwnedDappAddress = (): string | undefined => {
    return registeredDapps.value.find((x) => x.chain.owner === currentAccount.value)?.chain.address;
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

  const canStake = (stakes: DappStakeInfo[], availableTokensBalance: bigint): [boolean, string] => {
    let stakeSum = BigInt(0);

    for (const stake of stakes) {
      const stakeAmount = BigInt(ethers.utils.parseEther(stake.amount.toString()).toString());
      stakeSum += stakeAmount;
      if (!stake.address) {
        return [false, t('stakingV3.noDappSelected')];
      } else if (stake.amount <= 0) {
        return [false, t('stakingV3.dappStaking.ZeroAmount')];
      } else if (
        constants.value &&
        (ledger.value?.contractStakeCount ?? 0) >= constants.value.maxNumberOfStakedContracts
      ) {
        return [false, t('stakingV3.dappStaking.TooManyStakedContracts')];
      } else if (
        constants.value?.minStakeAmountToken &&
        stake.amount < constants.value.minStakeAmountToken
      ) {
        return [
          false,
          t('stakingV3.dappStaking.LockedAmountBelowThreshold', {
            amount: constants.value.minStakeAmountToken,
          }),
        ];
      } else if (protocolState.value?.maintenance) {
        return [false, t('stakingV3.dappStaking.Disabled')];
      } else if (stakeSum > availableTokensBalance) {
        return [false, t('stakingV3.dappStaking.UnavailableStakeFunds')];
      } else if (
        protocolState.value?.periodInfo.subperiod === PeriodType.BuildAndEarn &&
        protocolState.value.periodInfo.nextSubperiodStartEra <= protocolState.value.era + 1
      ) {
        return [false, t('stakingV3.dappStaking.PeriodEndsNextEra')];
      } else if (getDapp(stake.address)?.chain?.state === 'Unregistered') {
        return [false, t('stakingV3.dappStaking.NotOperatedDApp')];
      }
    }

    return [true, ''];
  };

  const canUnStake = async (dappAddress: string, amount: number): Promise<[boolean, string]> => {
    const stakeAmount = BigInt(ethers.utils.parseEther(amount.toString()).toString());
    const stakedAmount = BigInt(ledger.value?.locked?.toString() ?? 0);
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const [constants, stakerInfo] = await Promise.all([
      stakingRepo.getConstants(),
      stakingRepo.getStakerInfo(currentAccount.value, false),
    ]);

    if (amount <= 0) {
      // Prevents dappStaking.ZeroAmount
      return [false, t('stakingV3.dappStaking.ZeroAmount')];
    } else if (stakeAmount > stakedAmount) {
      // Prevents dappStaking.UnstakeAmountTooLarge
      return [false, t('stakingV3.dappStaking.UnstakeAmountTooLarge')];
    } else if (protocolState.value?.maintenance) {
      // Prevents dappStaking.Disabled
      return [false, t('stakingV3.dappStaking.Disabled')];
    } else if (!stakerInfo.get(dappAddress)) {
      // Prevents dappStaking.NoStakingInfo
      return [false, t('stakingV3.dappStaking.NoStakingInfo')];
    } else if (!amount) {
      // Prevents dappStaking.UnstakeFromPastPeriod
      return [false, t('stakingV3.dappStaking.UnstakeFromPastPeriod')];
    } else if ((ledger.value?.unlocking?.length ?? 0) >= constants.maxUnlockingChunks) {
      // Prevents dappStaking.TooManyUnlockingChunks
      return [false, t('stakingV3.dappStaking.TooManyUnlockingChunks')];
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

    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    const stakerInfo = await stakingService.getStakerInfo(currentAccount.value, false);

    store.commit('stakingV3/setStakerInfo', stakerInfo, { root: true });
  };

  const fetchTiersConfigurationToStore = async (): Promise<void> => {
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const tiersConfiguration = await stakingRepo.getTiersConfiguration();

    store.commit('stakingV3/setTiersConfiguration', tiersConfiguration);
  };

  const fetchEraLengthsToStore = async (): Promise<void> => {
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const eraLengths = await stakingRepo.getEraLengths();

    store.commit('stakingV3/setEraLengths', eraLengths);
  };

  const popError = (error: string): void => {
    const aggregator = container.get<IEventAggregator>(Symbols.EventAggregator);
    aggregator.publish(new ExtrinsicStatusMessage({ success: false, message: error }));
    return;
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
    eraLengths,
    isCurrentPeriod,
    unstake,
    claimStakerRewards,
    canStake,
    canUnStake,
    claimDappRewards,
    claimBonusRewards,
    claimStakerAndBonusRewards,
    getAllRewards,
    getDappRewards,
    fetchConstantsToStore,
    claimLockAndStake,
    getCurrentEraInfo,
    getDappTiers,
    getDappTier,
    fetchStakerInfoToStore,
    fetchTiersConfigurationToStore,
    withdraw,
    unlock,
    relock,
    unstakeFromUnregistered,
    fetchEraLengthsToStore,
    getUnclaimedDappRewardsPerPeriod,
    rewardExpiresInNextPeriod,
  };
}
