import { BN } from '@polkadot/util';
import { inject, injectable } from 'inversify';
import { XcmAssets } from 'src/store/assets/state';
import { Guard } from 'src/v2/common';
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

  public async getAssets(currentAccount: string): Promise<XcmAssets> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xcmRepository.getAssets(currentAccount);
    let ttlNativeXcmUsdAmount = 0;
    const isTransferPage = window.location.href.includes('transfer');

    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        if (asset.balance.gt(new BN(0))) {
          asset.userBalance = Number(
            this.balanceFormatterService.format(asset.balance, asset.metadata.decimals)
          );
          // Memo: fetch the USD price on the assets page only
          const price = isTransferPage
            ? 0
            : await this.priceRepository.getUsdPrice(asset.metadata.symbol);
          const userBalanceUsd = asset.userBalance * price;
          ttlNativeXcmUsdAmount += userBalanceUsd;
          return {
            ...asset,
            userBalanceUsd,
          };
        } else {
          return asset;
        }
      })
    );

    updatedAssets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
    return { assets: updatedAssets, ttlNativeXcmUsdAmount };
  }
}
