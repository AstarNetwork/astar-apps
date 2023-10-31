import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { EthBridgeChainId, ZkChainId, getChainIdFromNetId } from 'src/modules/zk-evm-bridge';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { IZkBridgeRepository } from 'src/v2/repositories/IZkBridgeRepository';
import { IWalletService, IZkBridgeService, ParamBridgeAsset, ParamClaim } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';

@injectable()
export class ZkBridgeService implements IZkBridgeService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.ZkBridgeRepository)
    private ZkBridgeRepository: IZkBridgeRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator,
    @inject(Symbols.CurrentWallet) private currentWallet: string
  ) {
    this.wallet = walletFactory();
  }

  private async checkConnectedNetwork(chainId: ZkChainId, web3: Web3): Promise<void> {
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

  public async approve(param: ParamBridgeAsset): Promise<String> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);

    const fromChainId = EthBridgeChainId[param.fromChainName];
    await this.checkConnectedNetwork(fromChainId, web3);

    const rawTx = await this.ZkBridgeRepository.getApproveData({
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

  public async bridgeAsset(param: ParamBridgeAsset): Promise<String> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);

    const fromChainId = EthBridgeChainId[param.fromChainName];
    await this.checkConnectedNetwork(fromChainId, web3);

    const rawTx = await this.ZkBridgeRepository.getBridgeAssetData({
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

  public async claimAsset(param: ParamClaim): Promise<String> {
    const provider = getEvmProvider(this.currentWallet as any);
    const web3 = new Web3(provider as any);

    const toChainId = getChainIdFromNetId(param.withdrawal.dest_net);
    await this.checkConnectedNetwork(toChainId, web3);

    const rawTx = await this.ZkBridgeRepository.getClaimData({
      param,
      web3,
    });
    const transactionHash = await this.wallet.sendEvmTransaction({
      from: String(rawTx.from),
      to: String(rawTx.to),
      data: String(rawTx.data),
    });
    return transactionHash;
  }
}
