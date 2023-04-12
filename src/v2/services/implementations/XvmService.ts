import { getShortenAddress } from '@astar-network/astar-sdk-core';
import { inject, injectable } from 'inversify';
import { XvmAssets } from 'src/store/assets/state';
import { Guard } from 'src/v2/common';
import { IEventAggregator } from 'src/v2/messaging';
import { IXvmRepository } from 'src/v2/repositories';
import { IWalletService } from 'src/v2/services';
import { IXvmService, XvmTransferParam, XvmGetAssetsParam } from 'src/v2/services/IXvmService';
import { Symbols } from 'src/v2/symbols';
import { addXvmTxHistories } from 'src/modules/xvm-transfer';

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

  public async transfer(param: XvmTransferParam): Promise<void> {
    Guard.ThrowIfUndefined('token', param.token);
    Guard.ThrowIfUndefined('recipientAddress', param.recipientAddress);
    Guard.ThrowIfUndefined('senderAddress', param.senderAddress);
    Guard.ThrowIfUndefined('amount', param.amount);
    Guard.ThrowIfNegative('amount', Number(param.amount));
    Guard.ThrowIfNegative('amount', Number(param.token.userBalance) - Number(param.amount));

    try {
      const transaction = await this.xvmRepository.getTransferCallData(param);
      const hash = await this.wallet.signAndSend({
        extrinsic: transaction,
        senderAddress: param.senderAddress,
        // Todo: update translation file
        successMessage: `You've successfully transferred ${param.amount} ${
          param.token.symbol
        } to ${getShortenAddress(param.recipientAddress)}`,
      });
      addXvmTxHistories({
        hash: String(hash),
        to: param.recipientAddress,
        symbol: param.token.symbol,
        amount: param.amount,
        address: param.senderAddress,
      });
    } catch (error) {
      console.error(error);
    } finally {
      param.finalizedCallback();
    }
  }
}
