import { inject, injectable } from 'inversify';
import { IDappStakingService } from './IDappStakingService';
import { DappStakingService } from './DappStakingService';
import { DappStakeInfo, SingularStakingInfo } from '../models';
import { IWalletService } from '../../../v2/services/IWalletService';
import { IDappStakingRepository } from '../repositories';
import { Symbols } from 'src/v2/symbols';
import { evmPrecompiledContract } from 'src/modules/precompiled';
import { IAccountUnificationRepository } from 'src/v2/repositories';

const { dispatch } = evmPrecompiledContract;

@injectable()
export class DappStakingServiceEvm extends DappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.DappStakingRepositoryV3) dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.AccountUnificationRepository)
    private accountUnificationRepository: IAccountUnificationRepository
  ) {
    super(dappStakingRepository, walletFactory);
    this.wallet = walletFactory();
  }

  // @inheritdoc
  public async claimLockAndStake(
    senderAddress: string,
    amountToLock: bigint,
    stakeInfo: DappStakeInfo[],
    unstakeFromAddress: string,
    unstakeAmount: bigint,
    successMessage: string
  ): Promise<void> {
    const ss58Address = await this.getSS58Address(senderAddress);
    this.guardStake(ss58Address, stakeInfo, unstakeFromAddress, unstakeAmount);

    const batch = await this.getClaimLockAndStakeBatch(
      ss58Address,
      amountToLock,
      stakeInfo,
      unstakeFromAddress,
      unstakeAmount
    );

    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: batch.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  public async getStakerInfo(
    address: string,
    includePreviousPeriods: boolean
  ): Promise<Map<string, SingularStakingInfo>> {
    const ss58Address = await this.getSS58Address(address);
    return await super.getStakerInfo(ss58Address, includePreviousPeriods);
  }

  private async getSS58Address(evmAddress: string): Promise<string> {
    return await this.accountUnificationRepository.getConvertedNativeAddress(evmAddress);
  }
}
