import { BN } from '@polkadot/util';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { Asset } from 'src/v2/models';
import { IPriceRepository, IXcmRepository } from 'src/v2/repositories';
import { IBalanceFormatterService, IXcmService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class XcmService implements IXcmService {
  constructor(
    @inject(Symbols.XcmRepository) private xcmRepository: IXcmRepository,
    @inject(Symbols.CoinGecko) private priceRepository: IPriceRepository,
    @inject(Symbols.BalanceFormatterService)
    private balanceFormatterService: IBalanceFormatterService
  ) {}

  public async getAssets(currentAccount: string): Promise<Asset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xcmRepository.getAssets(currentAccount);

    for (const asset of assets) {
      if (asset.balance > new BN(0)) {
        asset.userBalance = this.balanceFormatterService.format(
          asset.balance,
          asset.metadata.decimals
        );
        const price = await this.priceRepository.getUsdPrice(asset.metadata.name.toLowerCase());
        asset.userBalanceUsd = (Number(asset.userBalance) * price).toString();
      }
    }

    return assets;
  }
}
