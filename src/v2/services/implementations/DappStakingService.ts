import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { astarMainnetNativeToken, ASTAR_NATIVE_TOKEN } from 'src/config/chain';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { Guard } from 'src/v2/common';
import { TvlModel } from 'src/v2/models';
import { DappCombinedInfo, StakerInfo } from 'src/v2/models/DappsStaking';
import {
  IDappStakingRepository,
  IMetadataRepository,
  IPriceRepository,
  ISystemRepository,
} from 'src/v2/repositories';
import { IBalanceFormatterService, IDappStakingService, IGasPriceProvider } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { IWalletService } from '../IWalletService';
import { AccountLedger } from 'src/v2/models/DappsStaking';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { getEvmProvider } from 'src/hooks/helper/wallet';
import Web3 from 'web3';
import { getEvmGas } from '@astar-network/astar-sdk-core';
import DAPPS_STAKING_ABI from 'src/config/abi/DAPPS_STAKING.json';
import { AbiItem } from 'web3-utils';
import { BusyMessage, ExtrinsicStatusMessage, IEventAggregator } from 'src/v2/messaging';
import { getBlockscoutTx } from 'src/links';
import { AlertMsg } from 'src/modules/toast';

@injectable()
export class DappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;

  constructor(
    @inject(Symbols.DappStakingRepository) private dappStakingRepository: IDappStakingRepository,
    @inject(Symbols.PriceRepository) private priceRepository: IPriceRepository,
    @inject(Symbols.MetadataRepository) private metadataRepository: IMetadataRepository,
    @inject(Symbols.SystemRepository) private systemRepository: ISystemRepository,
    @inject(Symbols.BalanceFormatterService) private balanceFormatter: IBalanceFormatterService,
    @inject(Symbols.WalletFactory) walletFactory: () => IWalletService,
    @inject(Symbols.EventAggregator) readonly eventAggregator: IEventAggregator,

    @inject(Symbols.CurrentWallet) private currentWallet: string,
    @inject(Symbols.GasPriceProvider) private gasPriceProvider: IGasPriceProvider
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
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
    address: string;
    successMessage: string;
  }): Promise<void> {
    Guard.ThrowIfUndefined('fromContractId', fromContractId);
    Guard.ThrowIfUndefined('targetContractId', targetContractId);
    Guard.ThrowIfUndefined('stakerAddress', address);

    const stakeCall = await this.dappStakingRepository.getNominationTransferCall({
      amount,
      fromContractId,
      targetContractId,
    });
    await this.wallet.signAndSend({
      extrinsic: stakeCall,
      senderAddress: address,
      successMessage,
    });
  }

  public async stake(
    contractAddress: string,
    stakerAddress: string,
    amount: BN,
    successMessage: string
  ): Promise<void> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('stakerAddress', stakerAddress);
    const isH160 = isValidEvmAddress(stakerAddress);

    if (isH160) {
      const provider = getEvmProvider(this.currentWallet as any);
      const web3 = new Web3(provider as any);
      // const rawTx = await this.tokenTransferRepository.getEvmTransferData({
      //   param,
      //   web3,
      // });
      const [nonce, gasPrice] = await Promise.all([
        web3.eth.getTransactionCount(stakerAddress),
        getEvmGas(web3, this.gasPriceProvider.getGas().price),
      ]);

      const dappStakingContract = '0x0000000000000000000000000000000000005001';
      const contract = new web3.eth.Contract(DAPPS_STAKING_ABI as AbiItem[], dappStakingContract);

      const rawTx = {
        nonce,
        gasPrice: web3.utils.toHex(gasPrice),
        from: stakerAddress,
        to: dappStakingContract,
        value: '0x0',
        data: contract.methods.bond_and_stake(contractAddress, amount).encodeABI(),
      };
      const estimatedGas = await web3.eth.estimateGas(rawTx);
      await web3.eth
        .sendTransaction({ ...rawTx, gas: estimatedGas })
        .once('transactionHash', (transactionHash) => {
          this.eventAggregator.publish(new BusyMessage(true));
        })
        .then(({ transactionHash }) => {
          const explorerUrl = getBlockscoutTx(transactionHash);
          this.eventAggregator.publish(new BusyMessage(false));
          this.eventAggregator.publish(
            new ExtrinsicStatusMessage({
              success: true,
              message: successMessage,
              explorerUrl,
            })
          );
        })
        .catch((error: any) => {
          console.error(error);
          this.eventAggregator.publish(new BusyMessage(false));
          this.eventAggregator.publish(
            new ExtrinsicStatusMessage({
              success: false,
              message: error.message || AlertMsg.ERROR,
            })
          );
        });
    } else {
      const stakeCall = await this.dappStakingRepository.getBondAndStakeCall(
        contractAddress,
        amount
      );
      await this.wallet.signAndSend({
        extrinsic: stakeCall,
        senderAddress: stakerAddress,
        successMessage,
      });
    }
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
    await this.wallet.signAndSend({
      extrinsic: unboundCall,
      senderAddress: stakerAddress,
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
    network: string
  ): Promise<EditDappItem | undefined> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('network', network);

    return await this.dappStakingRepository.getDapp(contractAddress, network);
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
}
