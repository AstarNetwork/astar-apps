import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';
import { DappBase } from '../models';
import axios from 'axios';
import { injectable } from 'inversify';

/**
 * Interface for repository that handles dapp staking data.
 */
export interface IDappStakingRepository {
  getDapps(network: string): Promise<DappBase[]>;
}

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  public async getDapps(network: string): Promise<DappBase[]> {
    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dappssimple`;
    const response = await axios.get<DappBase[]>(url);

    return response.data;
  }
}
