import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';
import { DappBase } from '../models';
import axios from 'axios';
import { injectable } from 'inversify';

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
}

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  //* @inheritdoc
  public async getDapps(network: string): Promise<DappBase[]> {
    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dappssimple`;
    const response = await axios.get<DappBase[]>(url);

    return response.data;
  }
}
