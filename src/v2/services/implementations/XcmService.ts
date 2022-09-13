import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { XcmAssets } from 'src/store/assets/state';
import { Guard } from 'src/v2/common';
import { ITypeFactory, Network } from 'src/v2/config/types';
import { ExtrinsicPayload } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { IPriceRepository, IXcmRepository } from 'src/v2/repositories';
import { IBalanceFormatterService, IXcmService, IWalletService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

export const isParachain = (network: Network): boolean => !!network.parachainId;
export const isRelayChain = (network: Network): boolean => !isParachain(network);

@injectable()
export class XcmService implements IXcmService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.XcmRepository) private xcmRepository: IXcmRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.BalanceFormatterService)
    private balanceFormatterService: IBalanceFormatterService,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.TypeFactory) private typeFactory: ITypeFactory
  ) {
    this.wallet = walletFactory();
  }

  public async transfer(
    from: Network,
    to: Network,
    token: Asset,
    senderAddress: string,
    recipientAddress: string,
    amount: number
  ): Promise<void> {
    Guard.ThrowIfUndefined('recipientAddress', recipientAddress);
    Guard.ThrowIfNegative('amount', amount);
    this.GuardTransfer(amount, token);

    let call: ExtrinsicPayload | null = null;
    let tip: number | undefined; // If tip stays undefined, wallet infrastrucutre will fetch it.

    const amountBn = new BN(
      ethers.utils.parseUnits(amount.toString(), token.metadata.decimals).toString()
    );

    if (isParachain(from) && isRelayChain(to)) {
      // UMP
      call = await this.xcmRepository.getTransferToOriginChainCall(
        from,
        recipientAddress,
        amountBn
      );
    } else if (isRelayChain(from) && isParachain(to)) {
      // DMP
      call = await this.xcmRepository.getTransferToParachainCall(
        from,
        to,
        recipientAddress,
        token,
        amountBn
      );
      tip = 1; // TODO Not sure why is tip 1.
    } else if (isParachain(from) && isParachain(to)) {
      // HRMP
      // Dinamically determine parachain repository to use.
      const repository = <IXcmRepository>this.typeFactory.getInstance(from.chain);
      call = await repository.getTransferCall(from, to, recipientAddress, token, amountBn);
    } else {
      throw `Transfer between ${from.displayName} to ${to.displayName} is not supported. Currently supported transfers are UMP, DMP and HRMP.`;
    }

    if (call) {
      this.wallet.signAndSend(
        call,
        senderAddress,
        `You successfully transfered ${amount} ${token.metadata.symbol} to ${recipientAddress}`,
        tip
      );
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
        if (asset.balance.gt(new BN(0))) {
          asset.userBalance = Number(
            this.balanceFormatterService.format(asset.balance, asset.metadata.decimals)
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

  private GuardTransfer(amount: number, token: Asset) {
    // TODO implement balance and existential deposit check.
  }
}
