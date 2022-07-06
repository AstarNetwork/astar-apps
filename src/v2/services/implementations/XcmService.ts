import { BN } from '@polkadot/util';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { Asset, TokenInfo } from 'src/v2/models';
import { IPriceRepository, IXcmRepository } from 'src/v2/repositories';
import { IBalanceFormatterService, IXcmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class XcmService implements IXcmService {
  constructor(
    @inject(Symbols.XcmRepository) private xcmRepository: IXcmRepository,
    @inject(Symbols.PriceRepositoryWithFailover) private priceRepository: IPriceRepository,
    @inject(Symbols.BalanceFormatterService)
    private balanceFormatterService: IBalanceFormatterService
  ) {}

  public async getAssets(currentAccount: string): Promise<Asset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xcmRepository.getAssets(currentAccount);

    for (const asset of assets) {
      if (asset.balance.gt(new BN(0))) {
        asset.userBalance = Number(
          this.balanceFormatterService.format(asset.balance, asset.metadata.decimals)
        );
        const price = await this.priceRepository.getUsdPrice(
          new TokenInfo(asset.metadata.name, asset.metadata.symbol)
        );
        asset.userBalanceUsd = asset.userBalance * price;
      }
    }

    return assets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
  }
}
