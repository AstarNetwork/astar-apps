import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { ITokenTransferRepository } from 'src/v2/repositories/ITokenTransferRepository';
import { AssetTransferParam, EvmTransferParam, IWalletService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { ITokenTransferService } from '../ITokenTransferService';
import { getBlockscoutTx } from 'src/links';
import { AlertMsg } from 'src/modules/toast';

@injectable()
export class TokenTransferService implements ITokenTransferService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.TokenTransferRepository)
    private tokenTransferRepository: ITokenTransferRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.CurrentWallet) private currentWallet: string,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator
  ) {
    this.wallet = walletFactory();
  }

  public async transferNativeAsset(param: AssetTransferParam): Promise<void> {
    const transaction = await this.tokenTransferRepository.getNativeTransferCall(param);
    const hash = await this.wallet.signAndSend({
      extrinsic: transaction,
      senderAddress: param.senderAddress,
      successMessage: param.successMessage,
    });
    param.finalizedCallback(String(hash));
  }

  public async transferEvmAsset(param: EvmTransferParam): Promise<void> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);
    const rawTx = await this.tokenTransferRepository.getEvmTransferData({
      param,
      web3,
    });

    const estimatedGas = await web3.eth.estimateGas(rawTx);
    await web3.eth
      .sendTransaction({ ...rawTx, gas: estimatedGas })
      .once('transactionHash', (transactionHash) => {
        this.eventAggregator.publish(new BusyMessage(true));
      })
      .then(({ transactionHash }) => {
        const explorerUrl = getBlockscoutTx(transactionHash);
        this.eventAggregator.publish(new BusyMessage(false));
        this.eventAggregator.publish(
          new ExtrinsicStatusMessage({
            success: true,
            message: param.successMessage,
            explorerUrl,
          })
        );
        param.finalizedCallback(transactionHash);
      })
      .catch((error: any) => {
        console.error(error);
        this.eventAggregator.publish(new BusyMessage(false));
        this.eventAggregator.publish(
          new ExtrinsicStatusMessage({
            success: false,
            message: error.message || AlertMsg.ERROR,
          })
        );
      });
  }
}
