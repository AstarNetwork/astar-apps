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
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.BalanceFormatterService)
    private balanceFormatterService: IBalanceFormatterService
  ) {}

  public async getAssets(
    currentAccount: string
  ): Promise<{ assets: Asset[]; ttlNativeXcmUsdAmount: number }> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xcmRepository.getAssets(currentAccount);
    let ttlNativeXcmUsdAmount = 0;

    for (const asset of assets) {
      if (asset.balance.gt(new BN(0))) {
        asset.userBalance = Number(
          this.balanceFormatterService.format(asset.balance, asset.metadata.decimals)
        );
        const price = await this.priceRepository.getUsdPrice(asset.metadata.symbol);
        asset.userBalanceUsd = asset.userBalance * price;
        ttlNativeXcmUsdAmount += asset.userBalanceUsd;
      }
    }

    // return assets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
    assets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
    return { assets, ttlNativeXcmUsdAmount };
  }
}
