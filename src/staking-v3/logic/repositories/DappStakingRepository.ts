import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';
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

/**
 * Interface for repository that handles dapp staking data.
 */
export interface IDappStakingRepository {
  /**
   * Gets dapps data for the given network.
   * @param network The network to get dapp staking data for.
   * @returns A promise that resolves to an array of dapp staking data.
   */
  getDapps(network: string): Promise<DappBase[]>;

  /**
   * Gets dapp data for the given network and dapp address.
   * @param network Network name
   * @param dappAddress dApp address
   * @returns A promise that resolves to a dapp data.
   */
  getDapp(network: string, dappAddress: string): Promise<Dapp>;

  /**
   * Gets protocol state for the given network.
   * @param network The network to get protocol state for.
   */
  getProtocolState(): Promise<ProtocolState>;

  /**
   * Starts subscription to protocol state, so UI gets automatically updated when it changes.
   */
  startProtocolStateSubscription(): Promise<void>;

  /**
   * Gets all dapps within the network.
   */
  getChainDapps(): Promise<DappInfo[]>;
}

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.EventAggregator) private eventAggregator: IEventAggregator
  ) {}

  //* @inheritdoc
  public async getDapps(network: string): Promise<DappBase[]> {
    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dappssimple`;
    const response = await axios.get<DappBase[]>(url);

    return response.data;
  }

  //* @inheritdoc
  public async getDapp(network: string, dappAddress: string): Promise<Dapp> {
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
