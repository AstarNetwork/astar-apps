import { BN } from '@polkadot/util';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { ISystemRepository } from 'src/v2/repositories';
import { IAutoStakingService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { IWalletService } from '../IWalletService';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

@injectable()
export class AutoStakingService implements IAutoStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.SystemRepository) private systemRepository: ISystemRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService
  ) {
    this.wallet = walletFactory();
    this.systemRepository.startBlockSubscription();
  }

  public async stake(
    contractAddress: string,
    stakerAddress: string,
    _amount: BN,
    _successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('stakerAddress', stakerAddress);

    // TODO: implement from oak xcm demo
    await Promise.resolve();
  }

  public async sendTx({
    senderAddress,
    transaction,
    finalizedCallback,
  }: {
    senderAddress: string;
    transaction: SubmittableExtrinsic<'promise'>;
    finalizedCallback: (result?: ISubmittableResult) => void;
  }): Promise<void> {
    Guard.ThrowIfUndefined('senderAddress', senderAddress);
    Guard.ThrowIfUndefined('transaction', transaction);

    await this.wallet.signAndSend({
      extrinsic: transaction,
      senderAddress,
      finalizedCallback: finalizedCallback,
    });
  }
}
