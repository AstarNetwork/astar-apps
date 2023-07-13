import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { IAssetsRepository } from 'src/v2/repositories/IAssetsRepository';
import { IWalletService, IAssetsService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { getBlockscoutTx } from 'src/links';
import { AlertMsg } from 'src/modules/toast';
import {
  ParamAssetTransfer,
  ParamEvmTransfer,
  ParamEvmWithdraw,
} from 'src/v2/services/IAssetsService';

@injectable()
export class AssetsService implements IAssetsService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.AssetsRepository)
    private AssetsRepository: IAssetsRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.CurrentWallet) private currentWallet: string,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator
  ) {
    this.wallet = walletFactory();
  }

  public async transferNativeAsset(param: ParamAssetTransfer): Promise<void> {
    const transaction = await this.AssetsRepository.getNativeTransferCall(param);
    const hash = await this.wallet.signAndSend({
      extrinsic: transaction,
      senderAddress: param.senderAddress,
      successMessage: param.successMessage,
    });
    param.finalizedCallback(String(hash));
  }

  public async transferEvmAsset(param: ParamEvmTransfer): Promise<void> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);
    const rawTx = await this.AssetsRepository.getEvmTransferData({
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

  public async evmWithdraw({ amount, senderAddress }: ParamEvmWithdraw): Promise<void> {
    const transaction = await this.AssetsRepository.getEvmWithdrawCall({ amount, senderAddress });
    await this.wallet.signAndSend({
      extrinsic: transaction,
      senderAddress,
    });
  }

  public async unlockVestingTokens(senderAddress: string): Promise<void> {
    const transaction = await this.AssetsRepository.getVestCall();
    await this.wallet.signAndSend({
      extrinsic: transaction,
      senderAddress,
    });
  }
}
