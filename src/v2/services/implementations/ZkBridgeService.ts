import { inject, injectable } from 'inversify';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import { formatEtherAsNumber } from 'src/lib/formatters';
import { getRawEvmTransaction } from 'src/modules/evm';
import { EthBridgeChainId, type ZkChainId, getChainIdFromNetId } from 'src/modules/zk-evm-bridge';
import { ExtrinsicStatusMessage, type IEventAggregator } from 'src/v2/messaging';
import type { IZkBridgeRepository } from 'src/v2/repositories/IZkBridgeRepository';
import type { IWalletService, IZkBridgeService, ParamBridgeAsset, ParamClaim } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import Web3 from 'web3';
import { astarNativeTokenErcAddr } from './../../../modules/xcm/tokens/index';

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

  public async approve(param: ParamBridgeAsset): Promise<string> {
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

  // Memo: to check if users have enough ETH to pay the gas fee
  public async dryRunBridgeAsset(param: ParamBridgeAsset): Promise<boolean> {
    try {
      const provider = getEvmProvider(this.currentWallet as any);
      const web3 = new Web3(provider as any);

      const [accountBalanceWei, gasPriceWei, rawTx] = await Promise.all([
        web3.eth.getBalance(param.senderAddress),
        web3.eth.getGasPrice(),
        this.ZkBridgeRepository.getBridgeAssetData({
          param,
          web3,
        }),
      ]);

      const tx = await getRawEvmTransaction(
        web3,
        param.senderAddress,
        rawTx.to as string,
        rawTx.data as string,
        rawTx.value as string
      );

      // Memo: double the transaction fee here because MetaMask estimates higher gas fee than 'getGasPrice'
      // Fixme: find a way to duplicate how MetaMask works with fee calculation
      const feeAdj = 2;
      const gasPrice = formatEtherAsNumber(gasPriceWei) * feeAdj;
      const estimatedGas = await web3.eth.estimateGas({ ...tx });
      const txFee = gasPrice * Number(estimatedGas);
      const accountBalance = formatEtherAsNumber(accountBalanceWei);
      const sendingEth = param.tokenAddress === astarNativeTokenErcAddr ? Number(param.amount) : 0;
      const result = accountBalance - sendingEth - txFee > 0;
      return result;
    } catch (error) {
      return false;
    }
  }

  public async bridgeAsset(param: ParamBridgeAsset): Promise<string> {
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

  public async claimAsset(param: ParamClaim): Promise<string> {
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
