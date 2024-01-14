// Temporary service to be used on places (e.g. dApp registration) where different dApp staking
// service implementation (v2 or v3) is needed, depending on dApp staking version deployed on a node.
// TODO remove after Astar release.

import { container } from 'src/v2/common';
import { useDappStaking } from '../../hooks';
import { IDappStakingService } from 'src/v2/services';
import { IDappStakingService as IDappStakingServiceV3 } from '.';
import { Symbols } from 'src/v2/symbols';
import { inject, injectable } from 'inversify';
import { IApi } from 'src/v2/integration';
import { IDappStakingRepository as IDappStakingRepositoryV3 } from '../repositories';
import { EditDappItem } from 'src/store/dapp-staking/state';

export interface IDappStakingServiceV2V3 {
  getRegisteredContract(developerAddress: string): Promise<string | undefined>;

  /**
   * Gets dapp data from Firebase.
   * @param contractAddress Dapp contract address.
   * @param network Name of the network where dapp has been deployed.
   * @param forEdit Flag to indicate if dapp data should be fetched with encoded images.
   */
  getDapp(
    contractAddress: string,
    network: string,
    forEdit?: boolean
  ): Promise<EditDappItem | undefined>;
}

@injectable()
export class DappStakingServiceV2V3 implements IDappStakingServiceV2V3 {
  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.DappStakingService) private stakingV2: IDappStakingService,
    @inject(Symbols.DappStakingRepositoryV3) private repositoryV3: IDappStakingRepositoryV3
  ) {}

  public async getRegisteredContract(developerAddress: string): Promise<string | undefined> {
    if (await this.isV3()) {
      const allDapps = await this.repositoryV3.getChainDapps();
      const dapp = allDapps.find((d) => d.owner === developerAddress);

      return dapp?.address;
    } else {
      return await this.stakingV2.getRegisteredContract(developerAddress);
    }
  }

  public async getDapp(
    contractAddress: string,
    network: string,
    forEdit?: boolean
  ): Promise<EditDappItem | undefined> {
    return await this.stakingV2.getDapp(contractAddress, network, forEdit);
  }

  private async isV3() {
    const api = await this.api.getApi();
    return api.query.hasOwnProperty('dappStaking');
  }
}
