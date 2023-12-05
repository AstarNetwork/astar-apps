import { checkIsDappStakingV3 } from 'src/modules/dapp-staking';
import { TOKEN_API_URL, ExtrinsicPayload, getDappAddressEnum } from '@astar-network/astar-sdk-core';
import {
  AccountLedger,
  AccountLedgerChangedMessage,
  Constants,
  ContractStakeAmount,
  DAppTierRewards,
  Dapp,
  DappBase,
  DappInfo,
  DappState,
  EraInfo,
  EraRewardSpan,
  PeriodEndInfo,
  PeriodType,
  ProtocolState,
  ProtocolStateChangedMessage,
  SingularStakingInfo,
  StakeAmount,
  TiersConfiguration,
  TvlAmountType,
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
  SmartContractAddress,
} from '../interfaces';
import { IEventAggregator } from 'src/v2/messaging';
import { Option, StorageKey, u32, u128 } from '@polkadot/types';
import { IDappStakingRepository } from './IDappStakingRepository';
import { Guard } from 'src/v2/common';
import { ethers } from 'ethers';
import { AnyTuple, Codec } from '@polkadot/types/types';

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
  public async getDapp(network: string, dappAddress: string): Promise<Dapp> {
    Guard.ThrowIfUndefined(network, 'network');
    Guard.ThrowIfUndefined(dappAddress, 'dappAddress');
    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dapps/${dappAddress}`;
    const response = await axios.get<Dapp>(url);

    return response.data;
  }

  //* @inheritdoc
  public async getProtocolState(): Promise<ProtocolState | undefined> {
    const api = await this.api.getApi();
    if (!checkIsDappStakingV3(api)) return undefined;
    const state =
      await api.query.dappStaking.activeProtocolState<PalletDappStakingV3ProtocolState>();

    return this.mapToModel(state);
  }

  //* @inheritdoc
  private protocolStateSubscription: Function | undefined = undefined;
  public async startProtocolStateSubscription(): Promise<void> {
    const api = await this.api.getApi();
    if (!checkIsDappStakingV3(api)) return undefined;

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
  public async getLockCall(amount: number): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    const amountFormatted = this.getFormattedAmount(amount);

    return api.tx.dappStaking.lock(amountFormatted);
  }

  //* @inheritdoc
  public async getStakeCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();
    const amountFormatted = this.getFormattedAmount(amount);

    return api.tx.dappStaking.stake(getDappAddressEnum(contractAddress), amountFormatted);
  }

  //* @inheritdoc
  public async getLockAndStakeCall(
    contractAddress: string,
    amount: number
  ): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();

    return api.tx.utility.batchAll([
      api.tx.dappStaking.cleanupExpiredEntries(), // TODO not sure if this will be called automatically by a node.
      await this.getLockCall(amount),
      await this.getStakeCall(contractAddress, amount),
    ]);
  }

  //* @inheritdoc
  public async getUnstakeCall(contractAddress: string, amount: number): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();
    const amountFormatted = this.getFormattedAmount(amount);

    return api.tx.dappStaking.unstake(getDappAddressEnum(contractAddress), amountFormatted);
  }

  //* @inheritdoc
  public async getUnstakeFromUnregisteredCall(contractAddress: string): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();

    return api.tx.dappStaking.unstakeFromUnregistered(getDappAddressEnum(contractAddress));
  }

  //* @inheritdoc
  public async getUnlockCall(amount: number): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    const amountFormatted = this.getFormattedAmount(amount);

    return api.tx.dappStaking.unlock(amountFormatted);
  }

  private getFormattedAmount(amount: number): BigInt {
    return ethers.utils.parseEther(amount.toString()).toBigInt();
  }

  //* @inheritdoc
  public async getUnstakeAndUnlockCalls(
    contractAddress: string,
    amount: number
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
      standardErasPerBuildAndEarnPeriod: 10, // (<u32>(
      //   api.consts.dappStaking.standardErasPerBuildAndEarnPeriod
      // )).toNumber(),
      standardErasPerVotingPeriod: 2, // (<u32>(
      //   api.consts.dappStaking.standardErasPerVotingPeriod
      // )).toNumber(),
      unlockingPeriod: (<u32>api.consts.dappStaking.unlockingPeriod).toNumber(),
      standardEraLength: 30, // (<u32>api.consts.dappStaking.standardEraLength).toNumber(),
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
    return {
      period: tiers.period.toNumber(),
      dapps: tiers.dapps.map((dapp) => ({
        dappId: dapp.dappId.toNumber(),
        tierId: dapp.tierId.unwrapOr(undefined)?.toNumber(),
      })),
      rewards: tiers.rewards.map((reward) => reward.toBigInt()),
    };
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

    return api.tx.utility.batchAll(calls);
  }

  public async getCurrentEraInfo(): Promise<EraInfo> {
    const api = await this.api.getApi();
    const info = await api.query.dappStaking.currentEraInfo<PalletDappStakingV3EraInfo>();

    return {
      totalLocked: info.totalLocked.toBigInt(),
      activeEraLocked: info.activeEraLocked?.toBigInt(),
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
    const api = await this.api.getApi();
    const configuration =
      await api.query.dappStaking.tierConfig<PalletDappStakingV3TiersConfiguration>();

    return {
      numberOfSlots: configuration.numberOfSlots.toNumber(),
      slotsPerTier: configuration.slotsPerTier.map((slot) => slot.toNumber()),
      rewardPortion: configuration.rewardPortion.map((portion) => portion.toNumber() / 1_000_000),
      tierThresholds: configuration.tierThresholds.map((threshold) =>
        threshold.isDynamicTvlAmount
          ? {
              type: TvlAmountType.DynamicTvlAmount,
              amount: threshold.asDynamicTvlAmount.amount.toBigInt(),
              minimumAmount: threshold.asDynamicTvlAmount.minimumAmount.toBigInt(),
            }
          : {
              type: TvlAmountType.FixedTvlAmount,
              amount: threshold.asFixedTvlAmount.amount.toBigInt(),
            }
      ),
    };
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
      state: dapp.state.isUnregistered ? DappState.Unregistered : DappState.Registered,
      rewardDestination: dapp.rewardDestination.unwrapOr(undefined)?.toString(),
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
    stakers.forEach(([key, value]) => {
      const v = <Option<PalletDappStakingV3SingularStakingInfo>>value;

      if (v.isSome) {
        const unwrappedValue = v.unwrap();
        const address = this.getContractAddress(key.args[1] as unknown as SmartContractAddress);

        if (
          address &&
          (unwrappedValue.staked.period.toNumber() === currentPeriod || includePreviousPeriods)
        ) {
          result.set(address, <SingularStakingInfo>{
            loyalStaker: unwrappedValue.loyalStaker.isTrue,
            staked: this.mapStakeAmount(unwrappedValue.staked),
          });
        }
      }
    });

    console.log('Staker info size: ' + result.size);
    return result;
  }
}
