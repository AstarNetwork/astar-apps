import { inject, injectable } from 'inversify';
import { IEventAggregator } from 'src/v2/messaging';
import { IWalletService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { ITokenTransferService, NativeTokenTransferParam } from '../ITokenTransferService';
import { HistoryTxType } from 'src/modules/account/index';
import { addTxHistories } from 'src/modules/account/utils/index';
import { ITokenTransferRepository } from 'src/v2/repositories/ITokenTransferRepository';

@injectable()
export class TokenTransferService implements ITokenTransferService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.TokenTransferRepository)
    private tokenTransferRepository: ITokenTransferRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator
  ) {
    this.wallet = walletFactory();
  }
  public async transferNativeToken(param: NativeTokenTransferParam): Promise<void> {
    const transaction = await this.tokenTransferRepository.getTransferNativeTokenCall(param);
    const hash = await this.wallet.signAndSend(transaction, param.senderAddress);
    addTxHistories({
      hash: String(hash),
      type: HistoryTxType.Transfer,
      address: param.senderAddress,
    });
    param.finalizedCallback && param.finalizedCallback();
  }
}
