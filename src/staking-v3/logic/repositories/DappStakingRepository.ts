import { TOKEN_API_URL, ExtrinsicPayload, getDappAddressEnum } from '@astar-network/astar-sdk-core';
import {
  Dapp,
  DappBase,
  DappInfo,
  DappState,
  PeriodType,
  ProtocolState,
  ProtocolStateChangedMessage,
} from '../models';
import axios from 'axios';
import { inject, injectable } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IApi } from 'src/v2/integration';
import {
  PalletDappStakingV3DAppInfo,
  PalletDappStakingV3ProtocolState,
  SmartContractAddress,
} from '../interfaces';
import { IEventAggregator } from 'src/v2/messaging';
import { Option } from '@polkadot/types';
import { IDappStakingRepository } from './IDappStakingRepository';
import { Guard } from 'src/v2/common';
import { BigNumber, ethers } from 'ethers';

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
  public async startProtocolStateSubscription(): Promise<void> {
    const api = await this.api.getApi();
    await api.query.dappStaking.activeProtocolState((state: PalletDappStakingV3ProtocolState) => {
      this.eventAggregator.publish(new ProtocolStateChangedMessage(this.mapToModel(state)));
    });
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

  private getFormattedAmount(amount: number): BigInt {
    return ethers.utils.parseEther(amount.toString()).toBigInt();
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

  private getContractAddress(address: SmartContractAddress): string | undefined {
    return address.isEvm ? address.asEvm?.toString() : address.asWasm?.toString();
  }
}
