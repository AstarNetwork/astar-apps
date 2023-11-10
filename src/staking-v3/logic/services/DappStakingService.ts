import { inject, injectable } from 'inversify';
import { CombinedDappInfo } from '../models';
import { IDappStakingService } from './IDappStakingService';
import { Symbols } from 'src/v2/symbols';
import { IDappStakingRepository } from '../repositories';
import { Guard } from 'src/v2/common';
import { IWalletService } from 'src/v2/services';
import { ExtrinsicPayload } from '@astar-network/astar-sdk-core';

@injectable()
export class DappStakingService implements IDappStakingService {
  constructor(
    @inject(Symbols.DappStakingRepositoryV3) private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.WalletFactory) private walletFactory: () => IWalletService
  ) {}

  // @inheritdoc
  public async getDapps(network: string): Promise<CombinedDappInfo[]> {
    Guard.ThrowIfUndefined(network, 'network');

    const [storeDapps, chainDapps] = await Promise.all([
      this.dappStakingRepository.getDapps(network.toLowerCase()),
      this.dappStakingRepository.getChainDapps(),
    ]);

    // Map on chain and in store dApps
    const dApps: CombinedDappInfo[] = [];
    chainDapps.forEach((chainDapp) => {
      const storeDapp = storeDapps.find((x) => x.address === chainDapp.address);
      if (storeDapp) {
        dApps.push({
          basic: storeDapp,
          chain: chainDapp,
        });
      }
    });

    return dApps;
  }

  // @inheritdoc
  public async lockAndStake(
    contractAddress: string,
    amount: number,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const call = await this.dappStakingRepository.getLockAndStakeCall(contractAddress, amount);
    await this.signCall(call, senderAddress, successMessage);
  }

  // @inheritdoc
  public async unstakeAndUnlock(
    contractAddress: string,
    amount: number,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const call = await this.dappStakingRepository.getUnstakeAndUnlockCall(contractAddress, amount);
    await this.signCall(call, senderAddress, successMessage);
  }

  // @inheritdoc
  public async claimStakerRewards(senderAddress: string, successMessage: string): Promise<void> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const call = await this.dappStakingRepository.getClaimStakerRewardsCall();
    await this.signCall(call, senderAddress, successMessage);
  }

  // @inheritdoc
  public async getStakerRewards(senderAddress: string): Promise<number> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const protocolState = await this.dappStakingRepository.getProtocolState();
    const ledger = await this.dappStakingRepository.getAccountLedger(senderAddress);

    // *** 1. Determine last claimable era.
    // TODO - how to know if rewards expired
    const currentPeriod = protocolState.periodInfo.number;
    const firstStakedEra = Math.min(ledger.staked.era, ledger.stakedFuture?.era ?? Infinity);
    const lastStakedPeriod = Math.max(ledger.staked.period, ledger.stakedFuture?.period ?? 0);
    let lastStakedEra = 0;

    if (lastStakedPeriod < currentPeriod) {
      // Find last era from past period.
      const periodInfo = await this.dappStakingRepository.getPeriodEndInfo(lastStakedPeriod);
      lastStakedEra = periodInfo?.finalEra ?? 0; // periodInfo shouldn't be undefined for this case.
    } else if (lastStakedPeriod === currentPeriod) {
      // Find last era from current period.
      lastStakedEra = protocolState.era - 1;
    } else {
      // Most likely rewards expired.
      return 0;
    }

    // *** 2. Create list of all claimable eras with stake amounts
    for (let i = firstStakedEra; i <= lastStakedEra; i++) {
      // TODO - get staker rewards for era
    }

    return 0;
  }

  private async signCall(
    call: ExtrinsicPayload,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    const wallet = this.walletFactory();
    await wallet.signAndSend({
      extrinsic: call,
      senderAddress: senderAddress,
      successMessage,
    });
  }
}
