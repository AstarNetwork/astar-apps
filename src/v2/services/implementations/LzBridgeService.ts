import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { getRawEvmTransaction } from 'src/modules/evm';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { LayerZeroChainId } from 'src/modules/zk-evm-bridge';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { ILzBridgeRepository } from 'src/v2/repositories/ILzBridgeRepository';
import { IWalletService } from 'src/v2/services';
import { ILzBridgeService } from 'src/v2/services/ILzBridgeService';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { ParamApprove, ParamBridgeLzAsset } from '../ILzBridgeService';

@injectable()
export class LzBridgeService implements ILzBridgeService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.LzBridgeRepository)
    private LzBridgeRepository: ILzBridgeRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator,
    @inject(Symbols.CurrentWallet) private currentWallet: string
  ) {
    this.wallet = walletFactory();
  }

  private async checkConnectedNetwork(chainId: LayerZeroChainId, web3: Web3): Promise<void> {
    const connectedNetwork = await web3.eth.net.getId();
    if (connectedNetwork !== chainId) {
      const errMsg = "Connected Network doesn't match";
      this.eventAggregator.publish(
        new ExtrinsicStatusMessage({
          success: false,
          message: errMsg,
        })
      );
      throw Error(errMsg);
    }
    return;
  }

  public async approve(param: ParamApprove): Promise<string> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);

    await this.checkConnectedNetwork(param.fromChainId, web3);
    const rawTx = await this.LzBridgeRepository.getApproveData({
      param,
      web3,
    });

    const transactionHash = await this.wallet.sendEvmTransaction({
      from: String(rawTx.from),
      to: String(rawTx.to),
      value: String(rawTx.value),
      data: String(rawTx.data),
    });
    return transactionHash;
  }

  public async bridgeLzAsset(param: ParamBridgeLzAsset): Promise<string> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);
    await this.checkConnectedNetwork(param.fromChainId, web3);

    const { txParam } = await this.LzBridgeRepository.getBridgeLzAssetData({
      param,
      web3,
    });
    const transactionHash = await this.wallet.sendEvmTransaction({
      from: String(txParam.from),
      to: String(txParam.to),
      value: String(txParam.value),
      data: String(txParam.data),
    });
    return transactionHash;
  }

  // Memo: to check if users have enough native token to pay the gas and fee
  public async dryRunBridgeAsset(
    param: ParamBridgeLzAsset
  ): Promise<{ isGasPayable: boolean; fee: number }> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);

    const { txParam, nativeFee } = await this.LzBridgeRepository.getBridgeLzAssetData({
      param,
      web3,
    });

    try {
      const [accountBalanceWei, gasPriceWei] = await Promise.all([
        web3.eth.getBalance(param.senderAddress),
        web3.eth.getGasPrice(),
      ]);

      const tx = await getRawEvmTransaction(
        web3,
        param.senderAddress,
        txParam.to as string,
        txParam.data as string,
        txParam.value as string
      );

      const gasPrice = Number(ethers.utils.formatEther(gasPriceWei.toString()));
      const estimatedGas = await web3.eth.estimateGas({ ...tx });
      const gasFee = gasPrice * Number(estimatedGas);
      const accountBalance = Number(ethers.utils.formatEther(accountBalanceWei.toString()));
      const amountNativeToken =
        param.tokenAddress === astarNativeTokenErcAddr
          ? Number(param.amount) + nativeFee
          : nativeFee;

      const result = accountBalance - amountNativeToken - gasFee > 0;

      return { isGasPayable: result, fee: nativeFee };
    } catch (error) {
      console.error(error);
      return { isGasPayable: false, fee: nativeFee };
    }
  }
}
