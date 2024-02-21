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
  IDappStakingServiceV2Ledger,
  PeriodType,
  ProtocolState,
  Rewards,
  SingularStakingInfo,
  StakerRewards,
  TiersConfiguration,
} from '../logic';
import { Symbols } from 'src/v2/symbols';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { useStore } from 'src/store';
import { useAccount, useChainMetadata, useNetworkInfo, useLedger } from 'src/hooks';
import { useI18n } from 'vue-i18n';
import { useDapps } from './useDapps';
import { ethers } from 'ethers';

import { initialDappTiersConfiguration, initialTiersConfiguration } from '../store/state';
import { checkIsDappStakingV3 } from 'src/modules/dapp-staking';
import { ApiPromise } from '@polkadot/api';
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { docsUrl } from 'src/links';

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
  const { nativeTokenSymbol } = useNetworkInfo();
  const { isLedger } = useLedger();

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

  const totalStakerRewards = computed<BigInt>(
    () => rewards.value.staker.amount + rewards.value.bonus
  );

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

  const hasStakerRewards = computed<boolean>(() => !!rewards.value.staker.amount);
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
    getCurrentEraInfo();
    fetchStakeAmountsToStore();
    await fetchStakerInfoToStore();
    updateStakersCount([dapp.chain.address], -1);
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
    updateStakersCount(
      stakeInfo.map((x) => x.address),
      1
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
    if (isLedger.value) {
      const stakingService = container.get<IDappStakingServiceV2Ledger>(
        Symbols.DappStakingServiceV2Ledger
      );
      await stakingService.withdraw(currentAccount.value, t('stakingV3.withdrawSuccess'));
    } else {
      const stakingService = container.get<() => IDappStakingService>(
        Symbols.DappStakingServiceFactoryV3
      )();
      await stakingService.claimUnlockedTokens(
        currentAccount.value,
        t('stakingV3.withdrawSuccess')
      );
    }
    getCurrentEraInfo();
  };

  const relock = async (): Promise<void> => {
    const stakingService = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    await stakingService.relockUnlockingTokens(currentAccount.value, t('stakingV3.relockSuccess'));
  };

  const unlock = async (amount: bigint): Promise<void> => {
    if (isLedger.value) {
      const stakingService = container.get<IDappStakingServiceV2Ledger>(
        Symbols.DappStakingServiceV2Ledger
      );
      await stakingService.unlock(currentAccount.value, amount, t('stakingV3.unlockSuccess'));
    } else {
      const stakingService = container.get<() => IDappStakingService>(
        Symbols.DappStakingServiceFactoryV3
      )();
      await stakingService.unlockTokens(
        currentAccount.value,
        Number(ethers.utils.formatEther(amount)),
        t('stakingV3.unlockSuccess')
      );
    }
  };

  const getAllRewards = async (): Promise<void> => {
    const stakingV3service = container.get<() => IDappStakingService>(
      Symbols.DappStakingServiceFactoryV3
    )();
    const ownedContracts = getOwnedDappAddress();
    let staker = <StakerRewards>{
      amount: BigInt(0),
      eraCount: 0,
      period: 0,
    };
    let dApp = BigInt(0);
    let bonus = BigInt(0);

    if (currentAccount.value) {
      staker = await stakingV3service.getStakerRewards(currentAccount.value);
      bonus = await stakingV3service.getBonusRewards(currentAccount.value);

      if (ownedContracts.length > 0) {
        for await (const ownedContractAddress of ownedContracts) {
          if (ownedContractAddress) {
            const dAppRewards = await stakingV3service.getDappRewards(ownedContractAddress);
            dApp += dAppRewards;
          }
        }
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

  const getOwnedDappAddress = (): string[] => {
    return registeredDapps.value
      .filter((x) => x.chain.owner === currentAccount.value)
      .map((x) => x.chain.address);
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

  const canStake = (
    stakes: DappStakeInfo[],
    availableTokensBalance: bigint
    //Returns: [result, message, docsUrl]
  ): [boolean, string, string] => {
    let stakeSum = BigInt(0);

    for (const stake of stakes) {
      const stakeAmount = ethers.utils.parseEther(stake.amount.toString()).toBigInt();
      stakeSum += stakeAmount;
      if (!stake.address) {
        return [false, t('stakingV3.noDappSelected'), ''];
      } else if (stake.amount <= 0) {
        return [false, t('stakingV3.dappStaking.ZeroAmount'), ''];
      } else if (
        constants.value &&
        (ledger.value?.contractStakeCount ?? 0) >= constants.value.maxNumberOfStakedContracts
      ) {
        return [
          false,
          t('stakingV3.dappStaking.TooManyStakedContracts'),
          docsUrl.dappStakingStaked16Dapps,
        ];
      } else if (
        constants.value?.minStakeAmountToken &&
        stake.amount < constants.value.minStakeAmountToken &&
        getStakerInfo(stake.address) === undefined
      ) {
        return [
          false,
          t('stakingV3.dappStaking.LockedAmountBelowThreshold', {
            amount: constants.value.minStakeAmountToken,
          }),
          '',
        ];
      } else if (protocolState.value?.maintenance) {
        return [false, t('stakingV3.dappStaking.Disabled'), ''];
      } else if (stakeSum > availableTokensBalance) {
        return [false, t('stakingV3.dappStaking.UnavailableStakeFunds'), ''];
      } else if (
        constants.value &&
        ethers.utils.parseEther(constants.value.minBalanceAfterStaking.toString()).toBigInt() >
          availableTokensBalance - stakeSum
      ) {
        return [
          false,
          t('stakingV3.voting.minBalanceAfterStaking', {
            amount: constants.value.minBalanceAfterStaking,
            symbol: nativeTokenSymbol.value,
          }),
          '',
        ];
      } else if (
        protocolState.value?.periodInfo.subperiod === PeriodType.BuildAndEarn &&
        protocolState.value.periodInfo.nextSubperiodStartEra <= protocolState.value.era + 1
      ) {
        return [false, t('stakingV3.dappStaking.PeriodEndsNextEra'), ''];
      } else if (getDapp(stake.address)?.chain?.state === 'Unregistered') {
        return [false, t('stakingV3.dappStaking.NotOperatedDApp'), ''];
      }
    }

    return [true, '', ''];
  };

  const canUnStake = (dappAddress: string, amount: number): [boolean, string] => {
    const unstakeAmount = BigInt(ethers.utils.parseEther(amount.toString()).toString());
    const dappInfo = getStakerInfo(dappAddress);
    const stakedAmount = dappInfo?.staked.totalStake ?? BigInt(0);
    const stakeInfo = getStakerInfo(dappAddress);

    if (amount <= 0) {
      return [false, t('stakingV3.dappStaking.ZeroAmount')];
    } else if (unstakeAmount > stakedAmount) {
      return [false, t('stakingV3.dappStaking.UnstakeAmountTooLarge')];
    } else if (protocolState.value?.maintenance) {
      return [false, t('stakingV3.dappStaking.Disabled')];
    } else if (!dappInfo) {
      return [false, t('stakingV3.dappStaking.NoStakingInfo')];
    } else if (!amount) {
      return [false, t('stakingV3.dappStaking.UnstakeFromPastPeriod')];
    } else if (
      constants.value &&
      (ledger.value?.unlocking?.length ?? 0) >= constants.value.maxUnlockingChunks
    ) {
      return [false, t('stakingV3.dappStaking.TooManyUnlockingChunks')];
    } else if (constants.value && constants.value.minStakeAmount > stakedAmount - unstakeAmount) {
      // Handle unstaking all tokens.
      return [
        true,
        t('stakingV3.willUnstakeAll', {
          amount: constants.value.minStakeAmountToken,
        }),
      ];
    } else if (
      stakeInfo?.loyalStaker &&
      protocolState.value?.periodInfo.subperiod === PeriodType.BuildAndEarn &&
      stakeInfo.staked.totalStake - unstakeAmount < stakeInfo.staked.voting
    ) {
      // Handle possibility to lose bonus rewards.
      const message =
        stakeInfo.staked.buildAndEarn > BigInt(0)
          ? t('stakingV3.loyalStakerWarningAmount', {
              amount: ethers.utils.formatEther(stakeInfo.staked.buildAndEarn),
            })
          : t('stakingV3.loyalStakerWarning');

      return [true, message];
    }

    return [true, ''];
  };

  const canUnlock = (amount: number): [boolean, string] => {
    if (amount <= 0) {
      return [false, ''];
    } else if (
      constants.value &&
      (ledger.value?.unlocking?.length ?? 0) >= constants.value.maxUnlockingChunks
    ) {
      return [false, t('stakingV3.dappStaking.TooManyUnlockingChunks')];
    }

    return [true, ''];
  };

  const getStakerInfo = (dappAddress: string): SingularStakingInfo | undefined => {
    const isEvmAddress = isValidEvmAddress(dappAddress);

    return stakerInfo.value?.get(isEvmAddress ? dappAddress.toLowerCase() : dappAddress);
  };

  const getDappTiers = async (era: number): Promise<void> => {
    const stakingRepo = container.get<IDappStakingRepository>(Symbols.DappStakingRepositoryV3);
    const [tiers, leaderboard] = await Promise.all([
      stakingRepo.getDappTiers(era),
      stakingRepo.getLeaderboard(),
    ]);

    store.commit('stakingV3/setDappTiers', tiers);
    store.commit('stakingV3/setLeaderboard', leaderboard);
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
    const [tiersConfiguration, leaderboard] = await Promise.all([
      stakingRepo.getTiersConfiguration(),
      stakingRepo.getLeaderboard(),
    ]);

    store.commit('stakingV3/setTiersConfiguration', tiersConfiguration);
    store.commit('stakingV3/setLeaderboard', leaderboard);
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

  /**
   * Updates number of stakers for dApps in Vuex store. Stakers count comes from an indexer through Token API
   * and it doesn't make sense to reload from there because most likely the new stakers count won't be indexed
   * at the time of the call.
   * @param stakedContracts List of contract addresses for which stakers count should be updated.
   * @param amount expected value +1 in case of staking and -1 when unstaking.
   */
  const updateStakersCount = (stakedContracts: string[], amount: number): void => {
    for (const contract of stakedContracts) {
      const alreadyStaked = getStakerInfo(contract);
      if (!alreadyStaked) {
        const dapp = getDapp(contract);
        if (dapp && dapp.dappDetails) {
          const detailsClone = { ...dapp.dappDetails };
          detailsClone.stakersCount += amount;
          store.commit('stakingV3/updateDappDetails', detailsClone);
        }
      }
    }
  };

  const formatPeriod = (period: number): string => {
    return period.toString().padStart(3, '0');
  };

  const warnIfLedger = (): void => {
    // Show warning to ledger users.
    const { isLedger } = useLedger();
    const { isDappStakingV3 } = useDappStaking();
    if (isLedger.value && isDappStakingV3.value) {
      const eventAggregator = container.get<IEventAggregator>(Symbols.EventAggregator);
      eventAggregator.publish(
        new ExtrinsicStatusMessage({
          success: false,
          message: t('stakingV3.ledgerNotSupported'),
        })
      );
    }
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
    canUnlock,
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
    getStakerInfo,
    formatPeriod,
    warnIfLedger,
  };
}
