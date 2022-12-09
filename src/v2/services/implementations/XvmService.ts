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
    assets.forEach((it) => {
      ttlXvmUsdAmount += Number(it.userBalanceUsd);
    });

    assets.sort((a1, a2) => Number(a2.userBalanceUsd) - Number(a1.userBalanceUsd));

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
