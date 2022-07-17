import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
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
    recipientAddress: string,
    amount: number
  ): Promise<void> {
    Guard.ThrowIfUndefined('recipientAddress', recipientAddress);
    Guard.ThrowIfNegative('amount', amount);

    let call: ExtrinsicPayload | null = null;
    let tip: number | undefined; // If tip stays undefined, wallet infrastrucutre will fetch it.

    const amountBn = new BN(
      ethers.utils.parseUnits(amount.toString(), token.metadata.decimals).toString()
    );

    if (isParachain(from) && isRelayChain(to)) {
      // UMP
      call = await this.xcmRepository.getTransferToRelayChainCall(from, recipientAddress, amountBn);
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
      call = await repository.getTransferToParachainCall(
        from,
        to,
        recipientAddress,
        token,
        amountBn
      );
    } else {
      throw `Transfer between ${from.displayName} to ${to.displayName} is not supported. Currently supported transfers are UMP, DMP and HRMP.`;
    }

    if (call) {
      this.wallet.signAndSend(
        call,
        recipientAddress,
        `You successfully transfered ${amount} ${token.metadata.symbol} to ${recipientAddress}`,
        tip
      );
    } else {
      throw 'Call for XCM transfer can not be build';
    }
  }

  public async getAssets(currentAccount: string): Promise<Asset[]> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    const assets = await this.xcmRepository.getAssets(currentAccount);

    for (const asset of assets) {
      if (asset.balance.gt(new BN(0))) {
        asset.userBalance = Number(
          this.balanceFormatterService.format(asset.balance, asset.metadata.decimals)
        );
        const price = await this.priceRepository.getUsdPrice(asset.metadata.symbol);
        asset.userBalanceUsd = asset.userBalance * price;
      }
    }

    return assets.sort((a1, a2) => a2.userBalanceUsd - a1.userBalanceUsd);
  }
}
