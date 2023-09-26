import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { XcmAssets } from 'src/store/assets/state';
import { Guard } from 'src/v2/common';
import { ITypeFactory } from 'src/v2/config/types';
import { ExtrinsicPayload } from 'src/v2/integration';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import {
  Asset,
  checkIsDeposit,
  ethWalletChains,
  isParachain,
  isRelayChain,
  XcmChain,
} from 'src/v2/models';
import { IPriceRepository, IXcmRepository } from 'src/v2/repositories';
import { MoonbeamXcmRepository } from 'src/v2/repositories/implementations';
import {
  IBalanceFormatterService,
  IWalletService,
  IXcmService,
  TransferParam,
} from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { getSubscanExtrinsic } from 'src/links';

@injectable()
export class XcmService implements IXcmService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.XcmRepository) private xcmRepository: IXcmRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.BalanceFormatterService)
    private balanceFormatterService: IBalanceFormatterService,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.TypeFactory) private typeFactory: ITypeFactory,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator
  ) {
    this.wallet = walletFactory();
  }

  // Todo: return the hash
  public async transfer({
    from,
    to,
    token,
    senderAddress,
    recipientAddress,
    amount,
    finalizedCallback,
    successMessage,
    endpoint,
  }: TransferParam): Promise<void> {
    Guard.ThrowIfUndefined('recipientAddress', recipientAddress);
    Guard.ThrowIfNegative('amount', amount);
    this.GuardTransfer(amount, token);

    let call: ExtrinsicPayload | null = null;
    // Memo: if tip stays undefined, wallet infrastructure will fetch it.
    const tip = checkIsDeposit(from.name) ? 1 : undefined;

    const amountBn = new BN(
      ethers.utils.parseUnits(amount.toString(), token.metadata.decimals).toString()
    );

    const isDepositFromEthWallet = ethWalletChains.includes(from.name);

    if (isDepositFromEthWallet) {
      this.eventAggregator.publish(new BusyMessage(true));
      const repository = <MoonbeamXcmRepository>this.typeFactory.getInstance(from.name);
      const hash = await repository.evmTransferToParachain({
        toPara: to.parachainId,
        recipientAccountId: recipientAddress,
        amount: amountBn.toString(),
        token,
      });
      finalizedCallback && (await finalizedCallback(hash));
      const explorerUrl = getSubscanExtrinsic({ subscanBase: from.subscan, hash });
      this.eventAggregator.publish(
        new ExtrinsicStatusMessage({ success: true, message: successMessage, explorerUrl })
      );
      this.eventAggregator.publish(new BusyMessage(false));
      return;
    }

    if (isParachain(from) && isRelayChain(to)) {
      // UMP
      call = await this.xcmRepository.getTransferToOriginChainCall(
        from,
        recipientAddress,
        amountBn,
        endpoint
      );
    } else if (isRelayChain(from) && isParachain(to)) {
      // DMP
      call = await this.xcmRepository.getTransferToParachainCall(
        from,
        to,
        recipientAddress,
        token,
        amountBn,
        endpoint
      );
    } else if (isParachain(from) && isParachain(to)) {
      // HRMP
      // Dinamically determine parachain repository to use.
      const repository = <IXcmRepository>this.typeFactory.getInstance(from.name);
      call = await repository.getTransferCall(
        from,
        to,
        recipientAddress,
        token,
        amountBn,
        endpoint
      );
    } else {
      throw `Transfer between ${from.name} to ${to.name} is not supported. Currently supported transfers are UMP, DMP and HRMP.`;
    }

    if (call) {
      const hash = await this.wallet.signAndSend({
        extrinsic: call,
        senderAddress,
        successMessage,
        transactionTip: tip,
        subscan: from.subscan,
      });
      this.eventAggregator.publish(new BusyMessage(true));
      finalizedCallback && hash && (await finalizedCallback(hash));
      this.eventAggregator.publish(new BusyMessage(false));
    } else {
      throw 'Call for XCM transfer can not be build';
    }
  }

  public async getAssets(currentAccount: string, isFetchUsd: boolean): Promise<XcmAssets> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xcmRepository.getAssets(currentAccount);
    let ttlNativeXcmUsdAmount = 0;

    const updatedAssets = await Promise.all(
      assets.map(async (asset) => {
        const balance = Number(asset.balance);
        if (balance > 0) {
          asset.userBalance = Number(
            ethers.utils.formatUnits(asset.balance, asset.metadata.decimals)
          );
          // Memo: fetch the USD price on the assets page only
          const price = isFetchUsd
            ? await this.priceRepository.getUsdPrice(asset.metadata.symbol)
            : 0;
          const userBalanceUsd = asset.userBalance * price;
          ttlNativeXcmUsdAmount += userBalanceUsd;
          return {
            ...asset,
            userBalanceUsd,
          };
        } else {
          return asset;
        }
      })
    );

    updatedAssets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
    return { assets: updatedAssets, ttlNativeXcmUsdAmount };
  }

  public async getTokenBalance(
    address: string,
    chain: XcmChain,
    token: Asset,
    isNativeToken: boolean,
    endpoint: string
  ): Promise<string> {
    const repository = <IXcmRepository>this.typeFactory.getInstance(chain.name);
    return repository.getTokenBalance(address, chain, token, isNativeToken, endpoint);
  }

  public async getNativeBalance(address: string, chain: XcmChain, endpoint: string): Promise<BN> {
    const repository = <IXcmRepository>this.typeFactory.getInstance(chain.name);
    return repository.getNativeBalance(address, chain, endpoint);
  }

  private GuardTransfer(amount: number, token: Asset) {
    // TODO implement balance and existential deposit check.
  }
}
