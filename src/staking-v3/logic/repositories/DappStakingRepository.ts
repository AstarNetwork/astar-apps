import { TOKEN_API_URL, ExtrinsicPayload, getDappAddressEnum } from '@astar-network/astar-sdk-core';
import {
  AccountLedgerChangedMessage,
  Dapp,
  DappBase,
  DappInfo,
  DappState,
  PeriodType,
  ProtocolState,
  ProtocolStateChangedMessage,
  SingularStakingInfo,
  StakeAmount,
  StakerInfoChangedMessage,
} from '../models';
import axios from 'axios';
import { inject, injectable } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IApi } from 'src/v2/integration';
import {
  PalletDappStakingV3AccountLedger,
  PalletDappStakingV3DAppInfo,
  PalletDappStakingV3ProtocolState,
  PalletDappStakingV3SingularStakingInfo,
  PalletDappStakingV3StakeAmount,
  SmartContractAddress,
} from '../interfaces';
import { IEventAggregator } from 'src/v2/messaging';
import { Option, StorageKey } from '@polkadot/types';
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
  public async getProtocolState(): Promise<ProtocolState> {
    const api = await this.api.getApi();
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
          result.push({
            address,
            owner: unwrappedValue.owner.toString(),
            id: unwrappedValue.id.toNumber(),
            state: unwrappedValue.state.isUnregistered
              ? DappState.Unregistered
              : DappState.Registered,
            rewardDestination: unwrappedValue.rewardDestination.unwrapOr(undefined)?.toString(),
          });
        }
      }
    });

    return result;
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
        const mappedLedger = {
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

        this.eventAggregator.publish(new AccountLedgerChangedMessage(mappedLedger));
      }
    );

    // Ledger subscription returns Codec instead of Function and that's why we have casting dirty magic below.
    this.ledgerUnsubscribe = unsubscribe as unknown as Function;
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
  public async getUnlockCall(amount: number): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    const amountFormatted = this.getFormattedAmount(amount);

    return api.tx.dappStaking.unlock(amountFormatted);
  }

  private getFormattedAmount(amount: number): BigInt {
    return ethers.utils.parseEther(amount.toString()).toBigInt();
  }

  //* @inheritdoc
  public async getUnstakeAndUnlockCall(
    contractAddress: string,
    amount: number
  ): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    const api = await this.api.getApi();

    return api.tx.utility.batchAll([
      await this.getUnstakeCall(contractAddress, amount),
      await this.getUnlockCall(amount),
    ]);
  }

  //* @inheritdoc
  public async getClaimStakerRewardsCall(): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();
    return api.tx.dappStaking.claimStakerRewards();
  }

  private stakerInfoUnsubscribe: Function | undefined = undefined;
  //* @inheritdoc
  public async startGetStakerInfoSubscription(address: string): Promise<void> {
    Guard.ThrowIfUndefined(address, 'address');
    const api = await this.api.getApi();

    if (this.stakerInfoUnsubscribe) {
      this.stakerInfoUnsubscribe();
    }

    const unsubscribe = await api.query.dappStaking.stakerInfo.entries(
      address,
      (stakers: [StorageKey<AnyTuple>, Codec][]) => {
        const result = new Map<string, SingularStakingInfo>();
        stakers.forEach(([key, value]) => {
          const v = <Option<PalletDappStakingV3SingularStakingInfo>>value;

          if (v.isSome) {
            const unwrappedValue = v.unwrap();
            const address = this.getContractAddress(key.args[1] as unknown as SmartContractAddress);

            if (address) {
              result.set(address, <SingularStakingInfo>{
                loyalStaker: unwrappedValue.loyalStaker.isTrue,
                staked: this.mapStakeAmount(unwrappedValue.staked),
              });
            }
          }
        });

        this.eventAggregator.publish(new StakerInfoChangedMessage(result));
      }
    );

    this.stakerInfoUnsubscribe = unsubscribe as unknown as Function;
  }

  private mapToModel(state: PalletDappStakingV3ProtocolState): ProtocolState {
    return {
      era: state.era.toNumber(),
      nextEraStart: state.nextEraStart.toNumber(),
      periodInfo: {
        number: state.periodInfo.number.toNumber(),
        type: <PeriodType>state.periodInfo.periodType.type,
        endingEra: state.periodInfo.endingEra.toNumber(),
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

  private getContractAddress(address: SmartContractAddress): string | undefined {
    return address.isEvm ? address.asEvm?.toString() : address.asWasm?.toString();
  }
}
