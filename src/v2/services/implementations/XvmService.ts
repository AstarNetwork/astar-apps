import { inject, injectable } from 'inversify';
import { XvmAssets } from 'src/store/assets/state';
import { Guard } from 'src/v2/common';
import { IEventAggregator } from 'src/v2/messaging';
import { IXvmRepository } from 'src/v2/repositories';
import { IWalletService } from 'src/v2/services';
import { IXvmService, XvmTransferParam, XvmGetAssetsParam } from 'src/v2/services/IXvmService';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class XvmService implements IXvmService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.XvmRepository) private xvmRepository: IXvmRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator
  ) {
    this.wallet = walletFactory();
  }

  public async getAssets({
    currentAccount,
    isFetchUsd,
    srcChainId,
  }: XvmGetAssetsParam): Promise<XvmAssets> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xvmRepository.getAssets({ currentAccount, isFetchUsd, srcChainId });
    let ttlXvmUsdAmount = 0;

    // const updatedAssets = await Promise.all(
    //   assets.map(async (asset) => {
    //     if (asset.balance.gt(new BN(0))) {
    //       asset.userBalance = Number(
    //         this.balanceFormatterService.format(asset.balance, asset.metadata.decimals)
    //       );
    //       // Memo: fetch the USD price on the assets page only
    //       const price = isFetchUsd
    //         ? await this.priceRepository.getUsdPrice(asset.metadata.symbol)
    //         : 0;
    //       const userBalanceUsd = asset.userBalance * price;
    //       ttlNativeXcmUsdAmount += userBalanceUsd;
    //       return {
    //         ...asset,
    //         userBalanceUsd,
    //       };
    //     } else {
    //       return asset;
    //     }
    //   })
    // );

    // updatedAssets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
    return { xvmAssets: assets, ttlXvmUsdAmount };
  }
  public async transfer({
    token,
    senderAddress,
    recipientAddress,
    amount,
    finalizedCallback,
  }: XvmTransferParam): Promise<void> {}
}
