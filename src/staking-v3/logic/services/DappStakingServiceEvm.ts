import { inject, injectable } from 'inversify';
import { IDappStakingService } from './IDappStakingService';
import { DappStakingService } from './DappStakingService';
import { DappStakeInfo, SingularStakingInfo, StakerRewards } from '../models';
import { IWalletService } from '../../../v2/services/IWalletService';
import { IDappStakingRepository, IDataProviderRepository } from '../repositories';
import { Symbols } from 'src/v2/symbols';
import { evmPrecompiledContract } from 'src/modules/precompiled';
import { IAccountUnificationRepository } from 'src/v2/repositories';
import { Guard } from 'src/v2/common';

const { dispatch } = evmPrecompiledContract;

@injectable()
export class DappStakingServiceEvm extends DappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.DappStakingRepositoryV3) dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.TokenApiProviderRepository) tokenApiRepository: IDataProviderRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.AccountUnificationRepository)
    private accountUnificationRepository: IAccountUnificationRepository
  ) {
    super(dappStakingRepository, tokenApiRepository, walletFactory);
    this.wallet = walletFactory();
  }

  // @inheritdoc
  public async claimUnstakeAndUnlock(
    contractAddress: string,
    amount: number,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');
    Guard.ThrowIfNegative('amount', amount);

    const ss58Address = await this.getSS58Address(senderAddress);
    const batch = await this.getClaimUnstakeAndUnlockBatch(contractAddress, amount, ss58Address);

    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: batch.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  // @inheritdoc
  public async claimStakerRewards(senderAddress: string, successMessage: string): Promise<void> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const ss58Address = await this.getSS58Address(senderAddress);
    const batch = await this.getClaimStakerRewardsBatch(ss58Address);
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: batch.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  // @inheritdoc
  public async claimAllAndUnstakeFromUnregistered(
    senderAddress: string,
    contractAddress: string,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');

    const ss58Address = await this.getSS58Address(senderAddress);

    const batch = await this.getClaimAllAndUnstakeFromUnregisteredBatch(
      ss58Address,
      contractAddress
    );

    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: batch.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  public async unlockTokens(
    senderAddress: string,
    amount: number,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const call = await this.dappStakingRepository.getUnlockCall(amount);
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: call.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  // @inheritdoc
  public async claimDappRewards(
    contractAddress: string,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    const batch = await this.getClaimDappRewardsBatch(contractAddress);
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: batch.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  // @inheritdoc
  public async claimBonusRewards(senderAddress: string, successMessage: string): Promise<void> {
    Guard.ThrowIfUndefined('senderAddress', senderAddress);
    const ss58Address = await this.getSS58Address(senderAddress);
    const batch = await this.claimBonusRewardsBatch(ss58Address);

    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: batch.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  public async claimStakerAndBonusRewards(
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined('senderAddress', senderAddress);
    const ss58Address = await this.getSS58Address(senderAddress);
    const calls = await this.getClaimStakerAndBonusRewardsCalls(ss58Address);
    const batch = await this.dappStakingRepository.batchAllCalls(calls);

    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: batch.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
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

  // @inheritdoc
  public async claimUnlockedTokens(senderAddress: string, successMessage: string): Promise<void> {
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    const call = await this.dappStakingRepository.getClaimUnlockedTokensCall();
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: call.method.toHex(),
      successMessage,
      failureMessage: 'Call failed',
    });
  }

  // @inheritdoc
  public async relockUnlockingTokens(senderAddress: string, successMessage: string): Promise<void> {
    Guard.ThrowIfUndefined('senderAddress', senderAddress);

    const call = await this.dappStakingRepository.getRelockUnlockingTokensCall();
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: call.method.toHex(),
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

  public async getStakerRewards(senderAddress: string): Promise<StakerRewards> {
    const ss58Address = await this.getSS58Address(senderAddress);

    return await super.getStakerRewards(ss58Address);
  }

  public async getBonusRewards(senderAddress: string): Promise<bigint> {
    const ss58Address = await this.getSS58Address(senderAddress);

    return await super.getBonusRewards(ss58Address);
  }

  public async startAccountLedgerSubscription(address: string): Promise<void> {
    const ss58Address = await this.getSS58Address(address);

    await super.startAccountLedgerSubscription(ss58Address);
  }

  private async getSS58Address(evmAddress: string): Promise<string> {
    return await this.accountUnificationRepository.getConvertedNativeAddress(evmAddress);
  }
}
