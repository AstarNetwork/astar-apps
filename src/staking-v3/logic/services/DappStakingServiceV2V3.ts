// Temporary service to be used on places (e.g. dApp registration) where different dApp staking
// service implementation (v2 or v3) is needed, depending on dApp staking version deployed on a node.
// TODO remove after Astar release.

import { IDappStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { inject, injectable } from 'inversify';
import { IApi } from 'src/v2/integration';
import { IDappStakingRepository as IDappStakingRepositoryV3 } from '../repositories';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { TvlModel } from 'src/v2/models';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from 'src/v2/repositories';
import { ethers } from 'ethers';
import { ASTAR_NATIVE_TOKEN, astarMainnetNativeToken } from 'src/config/chain';

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

  getTvl(): Promise<TvlModel>;
}

@injectable()
export class DappStakingServiceV2V3 implements IDappStakingServiceV2V3 {
  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.DappStakingService) private stakingV2: IDappStakingService,
    @inject(Symbols.DappStakingRepositoryV3) private repositoryV3: IDappStakingRepositoryV3,
    @inject(Symbols.DappStakingRepository) private repositoryV2: IDappStakingRepository,
    @inject(Symbols.MetadataRepository) private metadataRepository: IMetadataRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository
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

  public async getTvl(): Promise<TvlModel> {
    const metadata = await this.metadataRepository.getChainMetadata();
    const v3 = await this.isV3();
    const [tvl, priceUsd] = await Promise.all([
      v3
        ? (await this.repositoryV3.getCurrentEraInfo()).totalLocked.toString()
        : this.repositoryV2.getTvl(),
      this.priceRepository.getUsdPrice(metadata.token),
    ]);

    const tvlDefaultUnit = Number(
      ethers.utils.formatUnits(BigInt(tvl.toString()), metadata.decimals)
    );
    const tvlUsd = astarMainnetNativeToken.includes(metadata.token as ASTAR_NATIVE_TOKEN)
      ? tvlDefaultUnit * priceUsd
      : 0;

    return new TvlModel(tvl, tvlDefaultUnit, tvlUsd);
  }

  private async isV3() {
    const api = await this.api.getApi();
    return api.query.hasOwnProperty('dappStaking');
  }
}
