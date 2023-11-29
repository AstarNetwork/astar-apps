import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { ASTAR_NATIVE_TOKEN, astarMainnetNativeToken } from 'src/config/chain';
import { evmPrecompiledContract } from 'src/modules/precompiled';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { Guard } from 'src/v2/common';
import { ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { TvlModel } from 'src/v2/models';
import { AccountLedger, DappCombinedInfo, StakerInfo } from 'src/v2/models/DappsStaking';
import {
  IDappStakingRepository,
  IMetadataRepository,
  IPriceRepository,
  ISystemRepository,
} from 'src/v2/repositories';
import {
  IDappStakingService,
  ParamClaimAll,
  ParamSetRewardDestination,
  ParamWithdraw,
} from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { IWalletService } from '../IWalletService';

const { dispatch } = evmPrecompiledContract;

@injectable()
export class EvmDappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.DappStakingRepository) private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.MetadataRepository) private metadataRepository: IMetadataRepository,
    @inject(Symbols.SystemRepository) private systemRepository: ISystemRepository,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator
  ) {
    this.wallet = walletFactory();
    this.systemRepository.startBlockSubscription();
    this.dappStakingRepository.starEraSubscription();
  }

  public async getTvl(): Promise<TvlModel> {
    const metadata = await this.metadataRepository.getChainMetadata();
    const [tvl, priceUsd] = await Promise.all([
      this.dappStakingRepository.getTvl(),
      this.priceRepository.getUsdPrice(metadata.token),
    ]);

    const tvlDefaultUnit = Number(
      ethers.utils.formatUnits(BigInt(tvl.toString()), metadata.decimals)
    );
    const tvlUsd = astarMainnetNativeToken.includes(metadata.token as ASTAR_NATIVE_TOKEN)
      ? tvlDefaultUnit * priceUsd
      : 0;

    return new TvlModel(tvl, tvlDefaultUnit, tvlUsd);
  }

  public async nominationTransfer({
    amount,
    fromContractId,
    targetContractId,
    address,
    successMessage,
    failureMessage,
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
    address: string;
    successMessage: string;
    failureMessage: string;
  }): Promise<void> {
    Guard.ThrowIfUndefined('fromContractId', fromContractId);
    Guard.ThrowIfUndefined('targetContractId', targetContractId);
    Guard.ThrowIfUndefined('stakerAddress', address);
    const stakeCall = await this.dappStakingRepository.getNominationTransferCall({
      amount,
      fromContractId,
      targetContractId,
    });
    await this.wallet.sendEvmTransaction({
      from: address,
      to: dispatch,
      data: stakeCall.method.toHex(),
      successMessage,
      failureMessage,
    });
  }

  public async stake(
    contractAddress: string,
    stakerAddress: string,
    amount: BN,
    successMessage: string,
    failureMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('stakerAddress', stakerAddress);
    const stakeCall = await this.dappStakingRepository.getBondAndStakeCall(contractAddress, amount);
    await this.wallet.sendEvmTransaction({
      from: stakerAddress,
      to: dispatch,
      data: stakeCall.method.toHex(),
      successMessage,
      failureMessage,
    });
  }

  public async unbondAndUnstake(
    contractAddress: string,
    stakerAddress: string,
    amount: BN,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('stakerAddress', stakerAddress);
    const unboundCall = await this.dappStakingRepository.getUnbondAndUnstakeCall(
      contractAddress,
      amount
    );
    await this.wallet.sendEvmTransaction({
      from: stakerAddress,
      to: dispatch,
      data: unboundCall.method.toHex(),
      successMessage,
    });
  }

  /**
   * Gets staker info (total staked, stakers count) for a given contracts.
   * @param contractAddresses List of contract addresses to provide info for.
   */
  public async getStakerInfo(
    contractAddresses: string[],
    walletAddress: string
  ): Promise<StakerInfo[]> {
    Guard.ThrowIfUndefined('contractAddresses', contractAddresses);

    const stakerInfos = await this.dappStakingRepository.getStakerInfo(
      contractAddresses,
      walletAddress
    );
    const metadata = await this.metadataRepository.getChainMetadata();

    return stakerInfos.map((x) => {
      x.totalStakeFormatted = ethers.utils.formatUnits(x.totalStake, metadata.decimals);
      return x;
    });
  }

  public async getCombinedInfo(currentAccount: string): Promise<DappCombinedInfo[]> {
    const dapps = await this.dappStakingRepository.getRegisteredDapps();
    const stakerInfo = await this.getStakerInfo(
      dapps.map((x) => x.address),
      currentAccount
    );

    return dapps.map((x, index) => {
      return new DappCombinedInfo(x, stakerInfo[index]);
    });
  }

  public async getRegisteredContract(developerAddress: string): Promise<string | undefined> {
    Guard.ThrowIfUndefined('developerAddress', developerAddress);

    return await this.dappStakingRepository.getRegisteredContract(developerAddress);
  }

  public async getDapp(
    contractAddress: string,
    network: string,
    forEdit = false
  ): Promise<EditDappItem | undefined> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('network', network);

    return await this.dappStakingRepository.getDapp(contractAddress, network, forEdit);
  }

  public async getLedger(accountAddress: string): Promise<AccountLedger> {
    Guard.ThrowIfUndefined('accountAddress', accountAddress);

    return await this.dappStakingRepository.getLedger(accountAddress);
  }

  public async canClaimRewardWithoutErrors(accountAddress: string): Promise<boolean> {
    Guard.ThrowIfUndefined('accountAddress', accountAddress);

    const ledger = await this.dappStakingRepository.getLedger(accountAddress);

    if (ledger.rewardDestination === 'StakeBalance') {
      const currentEra = await this.dappStakingRepository.getCurrentEra();
      const constants = await this.dappStakingRepository.getConstants();
      const stakerInfo = await this.dappStakingRepository.getGeneralStakerInfo(
        accountAddress,
        accountAddress
      );

      for (const [_, info] of stakerInfo) {
        const stakes = info.stakes;
        if (stakes.length === constants.maxEraStakeValues) {
          if (
            stakes[1].era - stakes[0].era > 1 &&
            stakes[constants.maxEraStakeValues - 1].era < currentEra.toNumber()
          ) {
            return false;
          }
        }
      }
    }

    return true;
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

  public async getStakeInfo(
    dappAddress: string,
    currentAccount: string
  ): Promise<StakeInfo | undefined> {
    Guard.ThrowIfUndefined('currentAccount', currentAccount);

    return await this.dappStakingRepository.getStakeInfo(dappAddress, currentAccount);
  }
  public async setRewardDestination({
    rewardDestination,
    senderAddress,
    successMessage,
  }: ParamSetRewardDestination) {
    const transaction = await this.dappStakingRepository.getSetRewardDestinationCall(
      rewardDestination
    );
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: transaction.method.toHex(),
      successMessage,
    });
  }

  public async withdraw({ senderAddress }: ParamWithdraw) {
    const transaction = await this.dappStakingRepository.getWithdrawCall();
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dispatch,
      data: transaction.method.toHex(),
    });
  }
  public async claimAll({
    batchTxs,
    maxBatchWeight,
    senderAddress,
    transferableBalance,
    finalizedCallback,
    invalidBalanceMsg,
    h160SenderAddress,
  }: ParamClaimAll): Promise<void> {
    try {
      const transaction = await this.dappStakingRepository.getClaimCall({
        batchTxs,
        maxBatchWeight,
        senderAddress,
        transferableBalance,
        invalidBalanceMsg,
        h160SenderAddress,
      });

      await this.wallet.sendEvmTransaction({
        from: h160SenderAddress || '',
        to: dispatch,
        data: transaction.method.toHex(),
      });
    } catch (error: any) {
      console.error(error);
      const message =
        error.message === 'dappStaking.error.invalidBalance' ? invalidBalanceMsg : error.message;
      this.eventAggregator.publish(new ExtrinsicStatusMessage({ success: false, message }));
    }
  }
}
