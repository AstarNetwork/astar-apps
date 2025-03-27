import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { getRawEvmTransaction } from 'src/modules/evm';
import { astarNativeTokenErcAddr } from 'src/modules/xcm';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { ICcipBridgeRepository } from 'src/v2/repositories/ICcipBridgeRepository';
import { IWalletService } from 'src/v2/services';
import { ICcipBridgeService, ParamFetchOutboundLimits } from 'src/v2/services/ICcipBridgeService';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { ParamApproveCcip, ParamBridgeCcipAsset } from '../ICcipBridgeService';
import { CcipChainId } from 'src/modules/ccip-bridge';
import { buildWeb3Instance, EVM } from 'src/config/web3';

@injectable()
export class CcipBridgeService implements ICcipBridgeService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.CcipBridgeRepository)
    private CcipBridgeRepository: ICcipBridgeRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator,
    @inject(Symbols.CurrentWallet) private currentWallet: string
  ) {
    this.wallet = walletFactory();
  }

  private async checkConnectedNetwork(chainId: CcipChainId, web3: Web3): Promise<void> {
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

  public async approve(param: ParamApproveCcip): Promise<string> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);

    await this.checkConnectedNetwork(param.fromChainId, web3);
    const rawTx = await this.CcipBridgeRepository.getApproveData({
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

  public async fetchFee(param: ParamBridgeCcipAsset): Promise<string> {
    const provider = buildWeb3Instance(Number(param.fromNetworkId) as EVM);
    const web3 = new Web3(provider as any);

    return await this.CcipBridgeRepository.getFee({
      param,
      web3,
    });
  }
  public async bridgeCcipAsset(param: ParamBridgeCcipAsset): Promise<string> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);
    await this.checkConnectedNetwork(param.fromNetworkId, web3);

    const { txParam } = await this.CcipBridgeRepository.getBridgeCcipAssetData({
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

  public async fetchOutboundLimits(param: ParamFetchOutboundLimits): Promise<string> {
    const provider = buildWeb3Instance(Number(param.fromNetworkId) as EVM);
    const web3 = new Web3(provider as any);

    return await this.CcipBridgeRepository.getOutboundLimits({
      param,
      web3,
    });
  }

  // Memo: to check if users have enough native token to pay the gas and fee
  public async dryRunBridgeAsset(
    param: ParamBridgeCcipAsset
  ): Promise<{ isGasPayable: boolean; fee: number }> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);

    const { txParam, nativeFee } = await this.CcipBridgeRepository.getBridgeCcipAssetData({
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
      const accountBalance = Number(ethers.utils.formatEther(accountBalanceWei));
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
