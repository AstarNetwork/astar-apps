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

    const { firstSpanIndex, lastSpanIndex, rewardsExpired } = await this.getStakerEraRange(
      senderAddress
    );

    if (rewardsExpired) {
      throw 'Staker rewards expired.';
    }

    const numberOfClaimCalls = lastSpanIndex - firstSpanIndex + 1;
    const call = await this.dappStakingRepository.getClaimStakerRewardsCall(numberOfClaimCalls);
    await this.signCall(call, senderAddress, successMessage);
  }

  // @inheritdoc
  public async getStakerRewards(senderAddress: string): Promise<bigint> {
    Guard.ThrowIfUndefined(senderAddress, 'senderAddress');

    const ledger = await this.dappStakingRepository.getAccountLedger(senderAddress);
    let result = BigInt(0);

    // *** 1. Determine last claimable era.
    const { firstStakedEra, lastStakedEra, firstSpanIndex, lastSpanIndex, rewardsExpired } =
      await this.getStakerEraRange(senderAddress);

    if (rewardsExpired) {
      return result;
    }

    // *** 2. Create list of all claimable eras with stake amounts.
    const claimableEras: Map<number, bigint> = new Map();
    for (let era = firstStakedEra; era <= lastStakedEra; era++) {
      let stakedSum = BigInt(0);

      if (ledger.staked.era <= era) {
        stakedSum += ledger.staked.voting + ledger.staked.buildAndEarn;
      }
      if (ledger.stakedFuture && ledger.stakedFuture.era <= era) {
        stakedSum += ledger.stakedFuture.voting + ledger.stakedFuture.buildAndEarn;
      }

      claimableEras.set(era, stakedSum);
    }

    // *** 3. Calculate rewards.
    for (let spanIndex = firstSpanIndex; spanIndex <= lastSpanIndex; spanIndex++) {
      const span = await this.dappStakingRepository.getEraRewards(spanIndex);
      if (!span) {
        continue;
      }

      for (let era = span.firstEra; era <= span.lastEra; era++) {
        const staked = claimableEras.get(era);
        if (staked) {
          const spanIndex = era - span.firstEra;
          result += (staked / span.span[spanIndex].staked) * span.span[spanIndex].stakerRewardPool;
        }
      }
    }

    return result;
  }

  // @inheritdoc
  public async getDappRewards(contractAddress: string): Promise<bigint> {
    const result = await this.getDappRewardsAndErasToClaim(contractAddress);

    return result.rewards;
  }

  public async claimDappRewards(
    contractAddress: string,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    const result = await this.getDappRewardsAndErasToClaim(contractAddress);

    if (result.erasToClaim.length === 0) {
      throw `No dApp rewards to claim for contract address ${contractAddress}.`;
    }

    const call = await this.dappStakingRepository.getClaimDappRewardsCall(
      contractAddress,
      result.erasToClaim
    );
    await this.signCall(call, senderAddress, successMessage);
  }

  // @inheritdoc
  public async getBonusRewards(senderAddress: string): Promise<bigint> {
    const result = await this.getBonusRewardsAndContractsToClaim(senderAddress);

    return result.rewards;
  }

  public async claimBonusRewards(senderAddress: string, successMessage: string): Promise<void> {
    const result = await this.getBonusRewardsAndContractsToClaim(senderAddress);

    if (result.contractsToClaim.length === 0) {
      throw `No bonus rewards to claim for sender address ${senderAddress}.`;
    }

    const call = await this.dappStakingRepository.getClaimBonusRewardsCall(result.contractsToClaim);
    await this.signCall(call, senderAddress, successMessage);
  }

  private async getBonusRewardsAndContractsToClaim(
    senderAddress: string
  ): Promise<{ rewards: bigint; contractsToClaim: string[] }> {
    let result = { rewards: BigInt(0), contractsToClaim: Array<string>() };
    const [stakerInfo, protocolState, constants] = await Promise.all([
      this.dappStakingRepository.startGetStakerInfo(senderAddress),
      this.dappStakingRepository.getProtocolState(),
      this.dappStakingRepository.getConstants(),
    ]);

    for (const [contract, info] of stakerInfo.entries()) {
      // Staker is eligible to bonus rewards if he is a loyal staker and if rewards are not expired
      // and if stake amount refers to the past period.
      if (
        info.loyalStaker &&
        info.staked.period >=
          protocolState.periodInfo.number - constants.rewardRetentionInPeriods &&
        info.staked.period < protocolState.periodInfo.number
      ) {
        const periodEndInfo = await this.dappStakingRepository.getPeriodEndInfo(info.staked.period);
        if (periodEndInfo) {
          result.rewards +=
            (info.staked.voting / periodEndInfo.totalVpStake) * periodEndInfo.bonusRewardPool;
          result.contractsToClaim.push(contract);
        } else {
          throw `Period end info not found for period ${info.staked.period}.`;
        }
      }
    }

    return result;
  }

  private async getDappRewardsAndErasToClaim(
    contractAddress: string
  ): Promise<{ rewards: bigint; erasToClaim: number[] }> {
    Guard.ThrowIfUndefined(contractAddress, 'contractAddress');

    const [protocolState, constants, dapp] = await Promise.all([
      this.dappStakingRepository.getProtocolState(),
      this.dappStakingRepository.getConstants(),
      this.dappStakingRepository.getChainDapp(contractAddress),
    ]);

    if (!dapp) {
      throw `Dapp with address ${contractAddress} not found on chain.`;
    }

    const result = { rewards: BigInt(0), erasToClaim: Array<number>() };

    // In case of period < rewardRetentionInPeriods use period 1.
    const firstPeriod = Math.max(
      protocolState.periodInfo.number - constants.rewardRetentionInPeriods,
      1
    );

    // Find the first era to claim rewards from. If we are at the first period, then we need to
    // start from era 2 since era 1 was voting.
    const firstEra =
      (await this.dappStakingRepository.getPeriodEndInfo(firstPeriod - 1))?.finalEra ?? 0 + 2;
    const lastEra = protocolState.era - 1;

    if (firstEra <= lastEra) {
      const tierRewards = await Promise.all(
        Array(lastEra - firstEra + 1)
          .fill(firstEra)
          .map((era, index) => this.dappStakingRepository.getDappTiers(era + index))
      );

      tierRewards.forEach((tierReward, index) => {
        if (tierReward) {
          const dApp = tierReward?.dapps.find((d) => d.dappId === dapp.id);
          if (dApp && dApp.tierId !== undefined) {
            result.rewards += tierReward.rewards[dApp.tierId];
            result.erasToClaim.push(firstEra + index);
          }
        }
      });
    } else {
      throw `First reward era can't be determined for dApp id ${dapp.id}.`;
    }

    return result;
  }

  private async getStakerEraRange(senderAddress: string) {
    const protocolState = await this.dappStakingRepository.getProtocolState();
    const ledger = await this.dappStakingRepository.getAccountLedger(senderAddress);
    const constants = await this.dappStakingRepository.getConstants();
    let rewardsExpired = false;

    // *** 1. Determine last claimable era.
    const currentPeriod = protocolState.periodInfo.number;
    const firstStakedEra = Math.min(
      ledger.staked.era > 0 ? ledger.staked.era : Infinity,
      ledger.stakedFuture?.era ?? Infinity
    );
    const lastStakedPeriod = Math.max(ledger.staked.period, ledger.stakedFuture?.period ?? 0);
    let lastStakedEra = 0;

    if (lastStakedPeriod <= currentPeriod - constants.rewardRetentionInPeriods) {
      // Rewards expired.
      rewardsExpired = true;
    } else if (lastStakedPeriod < currentPeriod) {
      // Find last era from past period.
      const periodInfo = await this.dappStakingRepository.getPeriodEndInfo(lastStakedPeriod);
      lastStakedEra = periodInfo?.finalEra ?? 0; // periodInfo shouldn't be undefined for this case.
    } else if (lastStakedPeriod === currentPeriod) {
      // Find last era from current period.
      lastStakedEra = protocolState.era - 1;
    } else {
      throw 'Invalid operation.';
    }

    const firstSpanIndex = firstStakedEra - (firstStakedEra % constants.eraRewardSpanLength);
    const lastSpanIndex = lastStakedEra - (lastStakedEra % constants.eraRewardSpanLength);

    return { firstStakedEra, lastStakedEra, firstSpanIndex, lastSpanIndex, rewardsExpired };
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
