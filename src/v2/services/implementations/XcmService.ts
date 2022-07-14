import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { Network } from 'src/v2/config/types';
import { ExtrinsicPayload } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { IPriceRepository, IXcmRepository } from 'src/v2/repositories';
import { IBalanceFormatterService, IXcmService, IWalletService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class XcmService implements IXcmService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.XcmRepository) private xcmRepository: IXcmRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.BalanceFormatterService)
    private balanceFormatterService: IBalanceFormatterService,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService
  ) {
    this.wallet = walletFactory();
  }

  public async transfer(
    from: Network,
    to: Network,
    token: Asset,
    recepientAddress: string,
    amount: number
  ): Promise<void> {
    let call: ExtrinsicPayload | null = null;
    const amountBn = new BN(
      ethers.utils.parseUnits(amount.toString(), token.metadata.decimals).toString()
    );

    if (from.parachainId && !to.parachainId) {
      // UMP
    } else if (!from.parachainId && to.parachainId) {
      // DMP
      call = await this.xcmRepository.getTransferToParachainCall(
        from,
        to,
        recepientAddress,
        amountBn
      );
    } else {
      // HRMP
    }

    if (call) {
      this.wallet.signAndSend(
        call,
        recepientAddress,
        `You successfully transfered ${amount} to ${recepientAddress}`,
        1
      );
    } else {
      throw 'Call for transfer method can not be build';
    }
  }

  public async getAssets(currentAccount: string): Promise<Asset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xcmRepository.getAssets(currentAccount);

    for (const asset of assets) {
      if (asset.balance.gt(new BN(0))) {
        asset.userBalance = Number(
          this.balanceFormatterService.format(asset.balance, asset.metadata.decimals)
        );
        const price = await this.priceRepository.getUsdPrice(asset.metadata.symbol);
        asset.userBalanceUsd = asset.userBalance * price;
      }
    }

    return assets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
  }
}
