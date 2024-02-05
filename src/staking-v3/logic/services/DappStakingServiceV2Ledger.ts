import { injectable, inject } from 'inversify';
import { IDappStakingServiceV2Ledger } from './IDappStakingServiceV2Ledger';
import { SignerService } from './SignerService';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingRepository } from '../repositories';
import { IWalletService } from 'src/v2/services';
import { Guard } from 'src/v2/common';

@injectable()
export class DappStakingServiceV2Ledger
  extends SignerService
  implements IDappStakingServiceV2Ledger
{
  constructor(
    @inject(Symbols.DappStakingRepositoryV3)
    protected dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService
  ) {
    super(walletFactory);
  }

  public async unlock(
    senderAddress: string,
    amount: bigint,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const call = await this.dappStakingRepository.getUnbondAndUnstakeCall(amount);
    await this.signCall(call, senderAddress, successMessage);
  }

  public async withdraw(senderAddress: string, successMessage: string): Promise<void> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const call = await this.dappStakingRepository.getWithdrawUnbondedCall();
    await this.signCall(call, senderAddress, successMessage);
  }
}
