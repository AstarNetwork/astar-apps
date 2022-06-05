import { ethers } from 'ethers';
import { inject, injectable } from 'inversify-props';
import { Guard } from 'src/v2/common';
import { TvlModel } from 'src/v2/models';
import { IDappStakRepository, IPriceRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingService } from '../';

@injectable()
export class DappStakingService implements IDappStakingService {
  constructor(
    @inject() private dappStakingRepository: IDappStakRepository,
    @inject(Symbols.CoinGecko) private priceRepository: IPriceRepository
  ) {
    Guard.ThrowIfUndefined('dappStakingRepository', dappStakingRepository);
    Guard.ThrowIfUndefined('priceRepository', priceRepository);
  }

  public async getTvl(): Promise<TvlModel> {
    const [tvl, priceUsd] = await Promise.all([
      this.dappStakingRepository.getTvl(),
      this.priceRepository.getUsdPrice('astar'), // TODO inject current network
    ]);

    const tvlDefaultUnit = Number(ethers.utils.formatUnits(BigInt(tvl.toString()), 18)); // TODO fetch decimals from metadata
    const tvlUsd = tvlDefaultUnit * priceUsd;

    return new TvlModel(tvl, tvlDefaultUnit, tvlUsd);
  }
}
