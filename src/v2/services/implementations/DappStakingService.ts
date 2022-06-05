import { ethers } from 'ethers';
import { inject, injectable } from 'inversify-props';
import { Guard } from 'src/v2/common';
import { TvlModel } from 'src/v2/models';
import { IDappStakingRepository, IMetadataRepository, IPriceRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingService } from 'src/v2/services';

@injectable()
export class DappStakingService implements IDappStakingService {
  constructor(
    @inject() private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.CoinGecko) private priceRepository: IPriceRepository,
    @inject() private metadataRepository: IMetadataRepository
  ) {
    Guard.ThrowIfUndefined('dappStakingRepository', dappStakingRepository);
    Guard.ThrowIfUndefined('priceRepository', priceRepository);
    Guard.ThrowIfUndefined('metadataRepository', metadataRepository);
  }

  public async getTvl(): Promise<TvlModel> {
    const metadata = await this.metadataRepository.getChainMetadata();
    const [tvl, priceUsd] = await Promise.all([
      this.dappStakingRepository.getTvl(),
      this.priceRepository.getUsdPrice(metadata.chain.toLowerCase()),
    ]);

    const tvlDefaultUnit = Number(
      ethers.utils.formatUnits(BigInt(tvl.toString()), metadata.decimals)
    );
    const tvlUsd = tvlDefaultUnit * priceUsd;

    return new TvlModel(tvl, tvlDefaultUnit, tvlUsd);
  }
}
