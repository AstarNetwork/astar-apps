import { TOKEN_API_URL, ExtrinsicPayload, getDappAddressEnum } from '@astar-network/astar-sdk-core';
import {
  AccountLedger,
  AccountLedgerChangedMessage,
  Constants,
  ContractStakeAmount,
  DAppTier,
  DAppTierRewards,
  Dapp,
  DappBase,
  DappInfo,
  DappState,
  EraInfo,
  EraLengths,
  EraRewardSpan,
  PeriodEndInfo,
  PeriodType,
  ProtocolState,
  ProtocolStateChangedMessage,
  SingularStakingInfo,
  StakeAmount,
  TiersConfiguration,
} from '../models';
import axios from 'axios';
import { inject, injectable } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IApi } from 'src/v2/integration';
import {
  PalletDappStakingV3AccountLedger,
  PalletDappStakingV3ContractStakeAmount,
  PalletDappStakingV3DAppInfo,
  PalletDappStakingV3DAppTierRewards,
  PalletDappStakingV3EraInfo,
  PalletDappStakingV3EraRewardSpan,
  PalletDappStakingV3PeriodEndInfo,
  PalletDappStakingV3ProtocolState,
  PalletDappStakingV3SingularStakingInfo,
  PalletDappStakingV3StakeAmount,
  PalletDappStakingV3TiersConfiguration,
  PalletDappStakingV3TiersConfigurationLegacy,
  PalletDappStakingV3TierThreshold,
  SmartContractAddress,
} from '../interfaces';
import { IEventAggregator } from 'src/v2/messaging';
import { Option, StorageKey, u32, u128, Bytes, u16 } from '@polkadot/types';
import { IDappStakingRepository } from './IDappStakingRepository';
import { Guard } from 'src/v2/common';
import { ethers } from 'ethers';
import { AnyTuple, Codec } from '@polkadot/types/types';
import { u8aToNumber } from '@polkadot/util';
import { HttpCodes } from 'src/constants';

const ERA_LENGTHS = new Map<string, EraLengths>([
  [
    'Shibuya Testnet',
    {
      standardErasPerBuildAndEarnPeriod: 20,
      standardErasPerVotingPeriod: 8,
      standardEraLength: 1800,
      periodsPerCycle: 2,
    },
  ],
  [
    'Shiden',
    {
      standardErasPerBuildAndEarnPeriod: 55,
      standardErasPerVotingPeriod: 6,
      standardEraLength: 7200,
      periodsPerCycle: 6,
    },
  ],
  [
    'Astar',
    {
      standardErasPerBuildAndEarnPeriod: 111,
      standardErasPerVotingPeriod: 11,
      standardEraLength: 7200,
      periodsPerCycle: 3,
    },
  ],
]);

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.EventAggregator) private eventAggregator: IEventAggregator
  ) {}

  //* @inheritdoc
  public async getDapps(network: string): Promise<DappBase[]> {
    Guard.ThrowIfUndefined(network, 'network');
    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dappssimple`;
    const response = await axios.get<DappBase[]>(url);

    return response.data;
  }

  //* @inheritdoc
  public async getDapp(
    network: string,
    dappAddress: string,
    forEdit = false
  ): Promise<Dapp | undefined> {
    Guard.ThrowIfUndefined(network, 'network');
    Guard.ThrowIfUndefined(dappAddress, 'dappAddress');
    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dapps/${dappAddress}?forEdit=${forEdit}`;

    try {
      const response = await axios.get<Dapp>(url);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === HttpCodes.NotFound) {
        return undefined;
      }

      throw error;
    }
  }

  //* @inheritdoc
  public async getProtocolState(block?: number): Promise<ProtocolState> {
    const api = await this.api.getApi(block);
    const state =
      await api.query.dappStaking.activeProtocolState<PalletDappStakingV3ProtocolState>();

    return this.mapToModel(state);
  }

  //* @inheritdoc
  private protocolStateSubscription: Function | undefined = undefined;
  public async startProtocolStateSubscription(): Promise<void> {
    const api = await this.api.getApi();

    if (this.protocolStateSubscription) {
      this.protocolStateSubscription();
    }

    const subscription = await api.query.dappStaking.activeProtocolState(
      (state: PalletDappStakingV3ProtocolState) => {
        this.eventAggregator.publish(new ProtocolStateChangedMessage(this.mapToModel(state)));
      }
    );
  }

  //* @inheritdoc
  public async getChainDapps(): Promise<DappInfo[]> {
    const api = await this.api.getApi();
    const dapps = await api.query.dappStaking.integratedDApps.entries();
    const result: DappInfo[] = [];

    dapps.forEach(([key, value]) => {
      const v = <Option<PalletDappStakingV3DAppInfo>>value;
      const address = this.getContractAddress(key.args[0] as unknown as SmartContractAddress);

      if (v.isSome) {
        const unwrappedValue = v.unwrap();

        if (address) {
          result.push(this.mapDapp(unwrappedValue, address));
        }
      }
    });

    return result;
  }

  public async getChainDapp(contractAddress: string): Promise<DappInfo | undefined> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');

    const api = await this.api.getApi();
    const dappWrapped = await api.query.dappStaking.integratedDApps<
      Option<PalletDappStakingV3DAppInfo>
    >(getDappAddressEnum(contractAddress));

    if (dappWrapped.isNone) {
      return undefined;
    }

    const dapp = dappWrapped.unwrap();
    return this.mapDapp(dapp, contractAddress);
  }

  private ledgerUnsubscribe: Function | undefined = undefined;
  public async startAccountLedgerSubscription(address: string): Promise<void> {
    const api = await this.api.getApi();

    if (this.ledgerUnsubscribe) {
      this.ledgerUnsubscribe();
    }

    const unsubscribe = await api.query.dappStaking.ledger(
      address,
      (ledger: PalletDappStakingV3AccountLedger) => {
        const mappedLedger = this.mapLedger(ledger);
        this.eventAggregator.publish(new AccountLedgerChangedMessage(mappedLedger));
      }
    );

    // Ledger subscription returns Codec instead of Function and that's why we have casting dirty magic below.
    this.ledgerUnsubscribe = unsubscribe as unknown as Function;
  }

  public async getAccountLedger(address: string): Promise<AccountLedger> {
    const api = await this.api.getApi();
    const ledger = await api.query.dappStaking.ledger<PalletDappStakingV3AccountLedger>(address);

    return this.mapLedger(ledger);
  }

  //* @inheritdoc
  public async getLockCall(amount: bigint): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();

    return api.tx.dappStaking.lock(amount);
  }

  //* @inheritdoc
  public async getStakeCall(contractAddress: string, amount: bigint): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();

    return api.tx.dappStaking.stake(getDappAddressEnum(contractAddress), amount);
  }

  //* @inheritdoc
  public async getMoveStakeCall(
    fromContractAddress: string,
    toContractAddress: string,
    amount: bigint
  ): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(fromContractAddress, 'fromContractAddress');
    Guard.ThrowIfUndefined(toContractAddress, 'toContractAddress');
    const api = await this.api.getApi();

    return api.tx.dappStaking.moveStake(
      getDappAddressEnum(fromContractAddress),
      getDappAddressEnum(toContractAddress),
      amount
    );
  }

  //* @inheritdoc
  public async getUnstakeCall(contractAddress: string, amount: bigint): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();

    return api.tx.dappStaking.unstake(getDappAddressEnum(contractAddress), amount);
  }

  //* @inheritdoc
  public async getUnstakeFromUnregisteredCall(contractAddress: string): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();

    return api.tx.dappStaking.unstakeFromUnregistered(getDappAddressEnum(contractAddress));
  }

  //* @inheritdoc
  public async getUnlockCall(amount: bigint): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();

    return api.tx.dappStaking.unlock(amount);
  }

  //* @inheritdoc
  public async getUnstakeAndUnlockCalls(
    contractAddress: string,
    amount: bigint
  ): Promise<ExtrinsicPayload[]> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();

    return [await this.getUnstakeCall(contractAddress, amount), await this.getUnlockCall(amount)];
  }

  //* @inheritdoc
  public async getClaimStakerRewardsCalls(numberOfCalls: number): Promise<ExtrinsicPayload[]> {
    const api = await this.api.getApi();
    const calls = Array(numberOfCalls)
      .fill(0)
      .map(() => api.tx.dappStaking.claimStakerRewards());

    return calls;
  }

  public async getPeriodEndInfo(period: number): Promise<PeriodEndInfo | undefined> {
    const api = await this.api.getApi();
    const infoWrapped = await api.query.dappStaking.periodEnd<
      Option<PalletDappStakingV3PeriodEndInfo>
    >(period);

    if (infoWrapped.isNone) {
      return undefined;
    }

    const info = infoWrapped.unwrap();
    return {
      bonusRewardPool: info.bonusRewardPool.toBigInt(),
      totalVpStake: info.totalVpStake.toBigInt(),
      finalEra: info.finalEra.toNumber(),
    };
  }

  //* @inheritdoc
  public async getEraRewards(spanIndex: number): Promise<EraRewardSpan | undefined> {
    const api = await this.api.getApi();
    const rewardsWrapped = await api.query.dappStaking.eraRewards<
      Option<PalletDappStakingV3EraRewardSpan>
    >(spanIndex);

    if (rewardsWrapped.isNone) {
      return undefined;
    }

    const rewards = rewardsWrapped.unwrap();
    return {
      firstEra: rewards.firstEra.toNumber(),
      lastEra: rewards.lastEra.toNumber(),
      span: rewards.span.map((reward) => ({
        stakerRewardPool: reward.stakerRewardPool.toBigInt(),
        staked: reward.staked.toBigInt(),
        dappRewardPool: reward.dappRewardPool.toBigInt(),
      })),
    };
  }

  public async getEraLengths(block?: number): Promise<EraLengths> {
    const getNumber = (bytes: Bytes): number => u8aToNumber(bytes.toU8a().slice(1, 4));
    const api = await this.api.getApi(block);

    if (api.rpc) {
      const [erasPerBuildAndEarn, erasPerVoting, eraLength, periodsPerCycle] = await Promise.all([
        api.rpc.state.call('DappStakingApi_eras_per_build_and_earn_subperiod', ''),
        api.rpc.state.call('DappStakingApi_eras_per_voting_subperiod', ''),
        api.rpc.state.call('DappStakingApi_blocks_per_era', ''),
        api.rpc.state.call('DappStakingApi_periods_per_cycle', ''),
      ]);

      return {
        standardErasPerBuildAndEarnPeriod: getNumber(erasPerBuildAndEarn),
        standardErasPerVotingPeriod: getNumber(erasPerVoting),
        standardEraLength: getNumber(eraLength),
        periodsPerCycle: getNumber(periodsPerCycle),
      };
    }

    // Can't use api.rpc for past blocks
    // Using constants should be fine, because era lengths are not expected to change
    // in near future.
    const currentApi = await this.api.getApi();
    const network = currentApi.runtimeChain.toHuman();
    const eraLen = ERA_LENGTHS.get(network);

    if (eraLen) {
      return eraLen;
    }

    throw new Error(`Era lengths are not defined for this network: ${network}`);
  }

  //* @inheritdoc
  public async getConstants(): Promise<Constants> {
    const api = await this.api.getApi();

    return {
      eraRewardSpanLength: (<u32>api.consts.dappStaking.eraRewardSpanLength).toNumber(),
      rewardRetentionInPeriods: (<u32>api.consts.dappStaking.rewardRetentionInPeriods).toNumber(),
      minStakeAmount: (<u128>api.consts.dappStaking.minimumStakeAmount).toBigInt(),
      minBalanceAfterStaking: 10,
      maxNumberOfStakedContracts: (<u32>(
        api.consts.dappStaking.maxNumberOfStakedContracts
      )).toNumber(),
      maxNumberOfContracts: (<u32>api.consts.dappStaking.maxNumberOfContracts).toNumber(),
      maxUnlockingChunks: (<u32>api.consts.dappStaking.maxUnlockingChunks).toNumber(),
      unlockingPeriod: (<u32>api.consts.dappStaking.unlockingPeriod).toNumber(),
      maxBonusSafeMovesPerPeriod: (<u32>(
        api.consts.dappStaking.maxBonusSafeMovesPerPeriod
      )).toNumber(),
    };
  }

  //* @inheritdoc
  public async getDappTiers(era: number): Promise<DAppTierRewards | undefined> {
    const api = await this.api.getApi();
    const tiersWrapped = await api.query.dappStaking.dAppTiers<
      Option<PalletDappStakingV3DAppTierRewards>
    >(era);

    if (tiersWrapped.isNone) {
      return undefined;
    }

    const tiers = tiersWrapped.unwrap();
    const dapps: DAppTier[] = [];
    tiers.dapps.forEach((value, key) =>
      dapps.push(this.mapDappTier(key.toNumber(), value.toNumber()))
    );
    return {
      period: tiers.period.toNumber(),
      dapps,
      rewards: tiers.rewards.map((reward) => reward.toBigInt()),
      rankRewards: tiers.rankRewards?.map((reward) => reward.toBigInt()) ?? [
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
      ], // for backward compatibility in case when not deployed on all networks
    };
  }

  //* @inheritdoc
  public async getLeaderboard(): Promise<Map<number, DAppTier>> {
    const api = await this.api.getApi();
    const tierAssignmentsBytes = await api.rpc.state.call(
      'DappStakingApi_get_dapp_tier_assignment',
      ''
    );
    const tierAssignment = api.createType('BTreeMap<u16, u8>', tierAssignmentsBytes);

    const result = new Map<number, DAppTier>();
    tierAssignment.forEach((value, key) =>
      result.set(key.toNumber(), this.mapDappTier(key.toNumber(), value.toNumber()))
    );

    return result;
  }

  public async getStakerInfo(
    address: string,
    includePreviousPeriods = false
  ): Promise<Map<string, SingularStakingInfo>> {
    Guard.ThrowIfUndefined(address, 'address');

    const api = await this.api.getApi();
    const [stakerInfos, protocolState] = await Promise.all([
      api.query.dappStaking.stakerInfo.entries(address),
      this.getProtocolState(),
    ]);

    return this.mapsStakerInfo(
      stakerInfos,
      protocolState!.periodInfo.number,
      includePreviousPeriods
    );
  }

  //* @inheritdoc
  public async getClaimDappRewardsCalls(
    contractAddress: string,
    erasToClaim: number[]
  ): Promise<ExtrinsicPayload[]> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');

    const calls: ExtrinsicPayload[] = [];
    const api = await this.api.getApi();
    erasToClaim.map((era) =>
      calls.push(api.tx.dappStaking.claimDappReward(getDappAddressEnum(contractAddress), era))
    );

    return calls;
  }

  public async getClaimBonusRewardsCalls(contractAddresses: string[]): Promise<ExtrinsicPayload[]> {
    const api = await this.api.getApi();
    const calls = contractAddresses.map((address) =>
      api.tx.dappStaking.claimBonusReward(getDappAddressEnum(address))
    );

    return calls;
  }

  public async batchAllCalls(calls: ExtrinsicPayload[]): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();

    return calls.length === 1 ? calls[0] : api.tx.utility.batchAll(calls);
  }

  public async getCurrentEraInfo(block?: number): Promise<EraInfo> {
    const api = await this.api.getApi(block);
    const info = await api.query.dappStaking.currentEraInfo<PalletDappStakingV3EraInfo>();

    return {
      totalLocked: info.totalLocked.toBigInt(),
      unlocking: info.unlocking.toBigInt(),
      currentStakeAmount: this.mapStakeAmount(info.currentStakeAmount),
      nextStakeAmount: this.mapStakeAmount(info.nextStakeAmount),
    };
  }

  public async getContractStake(dappId: number): Promise<ContractStakeAmount> {
    const api = await this.api.getApi();
    const contractStake =
      await api.query.dappStaking.contractStake<PalletDappStakingV3ContractStakeAmount>(dappId);

    return this.mapContractStakeAmount(contractStake);
  }

  public async getContractsStake(
    dappIds: number[],
    block?: number
  ): Promise<Map<number, ContractStakeAmount>> {
    const api = await this.api.getApi(block);
    const contractStakes =
      await api.query.dappStaking.contractStake.multi<PalletDappStakingV3ContractStakeAmount>(
        dappIds
      );

    return new Map<number, ContractStakeAmount>(
      contractStakes.map((contractStake, index) => [
        dappIds[index],
        this.mapContractStakeAmount(contractStake),
      ])
    );
  }

  //* @inheritdoc
  public async getClaimUnlockedTokensCall(): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    return api.tx.dappStaking.claimUnlocked();
  }

  //* @inheritdoc
  public async getRelockUnlockingTokensCall(): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    return api.tx.dappStaking.relockUnlocking();
  }

  public async getTiersConfiguration(): Promise<TiersConfiguration> {
    const TIER_DERIVATION_PALLET_VERSION = 8;
    const api = await this.api.getApi();
    const palletVersion = (await api.query.dappStaking.palletVersion<u16>()).toNumber();
    let configuration:
      | PalletDappStakingV3TiersConfiguration
      | PalletDappStakingV3TiersConfigurationLegacy;

    if (palletVersion >= TIER_DERIVATION_PALLET_VERSION) {
      configuration =
        await api.query.dappStaking.tierConfig<PalletDappStakingV3TiersConfiguration>();
    } else {
      configuration =
        await api.query.dappStaking.tierConfig<PalletDappStakingV3TiersConfigurationLegacy>();
    }

    return {
      numberOfSlots: configuration.slotsPerTier.reduce((acc, val) => acc + val.toNumber(), 0),
      slotsPerTier: configuration.slotsPerTier.map((slot) => slot.toNumber()),
      rewardPortion: configuration.rewardPortion.map((portion) => portion.toNumber() / 1_000_000),
      tierThresholds: configuration.tierThresholds.map((threshold) => {
        // Support both u128 and PalletDappStakingV3TierThreshold.
        // If threshold has isUnsigned property it's u128.
        // TODO: remove palletVersion check when u128 is used for all thresholds. Most likely in Astar period 003.
        if (palletVersion < TIER_DERIVATION_PALLET_VERSION) {
          const t = <PalletDappStakingV3TierThreshold>threshold;
          if (t.isDynamicTvlAmount) {
            return t.asDynamicTvlAmount.amount.toBigInt();
          }

          return t.asFixedTvlAmount.amount.toBigInt();
        }

        const t = <u128>threshold;
        return t.toBigInt();
      }),
    };
  }

  public async getCleanupExpiredEntriesCall(): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    return api.tx.dappStaking.cleanupExpiredEntries();
  }

  /** @inheritdoc */
  public async getUnbondAndUnstakeCall(amount: bigint): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    // Memo: address is ignored by runtime, but we need to pass something
    // because runtime needs to keep the method signature.
    return api.tx.dappStaking.unbondAndUnstake(
      getDappAddressEnum('ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8'),
      amount
    );
  }

  /** @inheritdoc */
  public async getWithdrawUnbondedCall(): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    return api.tx.dappStaking.withdrawUnbonded();
  }

  public async getRegisterDappCall(
    developerAddress: string,
    dappAddress: string
  ): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    const address = getDappAddressEnum(dappAddress);
    return api.tx.dappStaking.register(developerAddress, address);
  }

  // ------------------ MAPPERS ------------------
  private mapToModel(state: PalletDappStakingV3ProtocolState): ProtocolState {
    return {
      era: state.era.toNumber(),
      nextEraStart: state.nextEraStart.toNumber(),
      periodInfo: {
        number: state.periodInfo.number.toNumber(),
        subperiod: <PeriodType>state.periodInfo.subperiod.type,
        nextSubperiodStartEra: state.periodInfo.nextSubperiodStartEra.toNumber(),
      },
      maintenance: state.maintenance.isTrue,
    };
  }

  private mapStakeAmount(dapp: PalletDappStakingV3StakeAmount): StakeAmount {
    return {
      voting: dapp.voting.toBigInt(),
      buildAndEarn: dapp.buildAndEarn.toBigInt(),
      era: dapp.era.toNumber(),
      period: dapp.period.toNumber(),
      totalStake: dapp.voting.toBigInt() + dapp.buildAndEarn.toBigInt(),
    };
  }

  private mapContractStakeAmount(
    amount: PalletDappStakingV3ContractStakeAmount
  ): ContractStakeAmount {
    return {
      staked: this.mapStakeAmount(amount.staked),
      stakedFuture: amount.stakedFuture.isSome
        ? this.mapStakeAmount(amount.stakedFuture.unwrap())
        : undefined,
    };
  }

  private mapLedger(ledger: PalletDappStakingV3AccountLedger): AccountLedger {
    return <AccountLedger>{
      locked: ledger.locked.toBigInt(),
      unlocking: ledger.unlocking.map((chunk) => ({
        amount: chunk.amount.toBigInt(),
        unlockBlock: chunk.unlockBlock.toBigInt(),
      })),
      staked: this.mapStakeAmount(ledger.staked),
      stakedFuture: ledger.stakedFuture.isSome
        ? this.mapStakeAmount(ledger.stakedFuture.unwrap())
        : undefined,
      contractStakeCount: ledger.contractStakeCount.toNumber(),
    };
  }

  private mapDapp(dapp: PalletDappStakingV3DAppInfo, address: string): DappInfo {
    return {
      address,
      owner: dapp.owner.toString(),
      id: dapp.id.toNumber(),
      state: DappState.Registered, // All dApss from integratedDApps are registered.
      rewardDestination: dapp.rewardBeneficiary.unwrapOr(undefined)?.toString(),
    };
  }

  private getContractAddress(address: SmartContractAddress): string | undefined {
    return address.isEvm ? address.asEvm?.toString() : address.asWasm?.toString();
  }

  private mapsStakerInfo(
    stakers: [StorageKey<AnyTuple>, Codec][],
    currentPeriod: number,
    includePreviousPeriods: boolean
  ): Map<string, SingularStakingInfo> {
    const result = new Map<string, SingularStakingInfo>();
    for (const [key, value] of stakers) {
      const v = <Option<PalletDappStakingV3SingularStakingInfo>>value;

      if (v.isSome) {
        const unwrappedValue = v.unwrap();
        const address = this.getContractAddress(key.args[1] as unknown as SmartContractAddress);

        if (
          address &&
          (unwrappedValue.staked.period.toNumber() === currentPeriod || includePreviousPeriods)
        ) {
          //0 means the bonus is forfeited, and 1 or greater indicates that the stake is eligible for bonus.
          const bonusStatus = unwrappedValue.bonusStatus.toNumber();
          result.set(address, <SingularStakingInfo>{
            loyalStaker: bonusStatus > 0,
            staked: this.mapStakeAmount(unwrappedValue.staked),
            previousStaked: this.mapStakeAmount(unwrappedValue.previousStaked),
            bonusStatus,
          });
        }
      }
    }

    console.log(`Staker info size: ${result.size}`);
    return result;
  }

  private mapDappTier(dappId: number, rankTier: number): DAppTier {
    return {
      dappId: dappId,
      tierId: rankTier & 0xf,
      rank: rankTier >> 4,
    };
  }
}
