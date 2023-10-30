import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';
import { Dapp, DappBase, PeriodType, ProtocolState } from '../models';
import axios from 'axios';
import { inject, injectable } from 'inversify';
import { Symbols } from 'src/v2/symbols';
import { IApi } from 'src/v2/integration';
import { PalletDappStakingV3ProtocolState } from '../interfaces';

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
}

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  constructor(@inject(Symbols.DefaultApi) private api: IApi) {}

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
}
