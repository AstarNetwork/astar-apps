import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import DAPPS_STAKING_ABI from 'src/config/web3/abi/dapps-staking-abi.json';
import MULTI_CALL_ABI from 'src/config/web3/abi/multicall3.json';
import { ASTAR_NATIVE_TOKEN, astarMainnetNativeToken } from 'src/config/chain';
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
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { IWalletService } from '../IWalletService';
import { Contract } from 'web3-eth-contract';
import { RewardDestination } from 'src/hooks';

const dappStakingContract = '0x0000000000000000000000000000000000005001';
//Todo: add shiden and astar's
const multiCall3Contract = '0x271C2cFa8204Ffad3Feb48faDE001bC9457C1EA7'; //shibuya

@injectable()
export class EvmDappStakingService implements IDappStakingService {
  private readonly wallet: IWalletService;
  private readonly evmContract: Contract;
  private readonly multiCallContract: Contract;

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
    const web3 = new Web3();
    this.evmContract = new web3.eth.Contract(DAPPS_STAKING_ABI as AbiItem[], dappStakingContract);
    this.multiCallContract = new web3.eth.Contract(MULTI_CALL_ABI as AbiItem[], multiCall3Contract);
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
    await this.wallet.sendEvmTransaction({
      from: address,
      to: dappStakingContract,
      data: this.evmContract.methods
        .nomination_transfer(fromContractId, amount, targetContractId)
        .encodeABI(),
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
    await this.wallet.sendEvmTransaction({
      from: stakerAddress,
      to: dappStakingContract,
      data: this.evmContract.methods.bond_and_stake(contractAddress, amount).encodeABI(),
      successMessage,
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
    await this.wallet.sendEvmTransaction({
      from: stakerAddress,
      to: dappStakingContract,
      data: this.evmContract.methods.unbond_and_unstake(contractAddress, amount).encodeABI(),
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
  public async setRewardDestination({
    rewardDestination,
    senderAddress,
    successMessage,
  }: ParamSetRewardDestination) {
    // Ref: Enum from https://github.com/AstarNetwork/astar-frame/blob/polkadot-v0.9.39/frame/dapps-staking/src/lib.rs#L554
    const destination = rewardDestination === RewardDestination.FreeBalance ? 0 : 1;
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dappStakingContract,
      data: this.evmContract.methods.set_reward_destination(destination).encodeABI(),
      successMessage,
    });
  }

  public async withdraw({ senderAddress }: ParamWithdraw) {
    await this.wallet.sendEvmTransaction({
      from: senderAddress,
      to: dappStakingContract,
      data: this.evmContract.methods.withdraw_unbonded().encodeABI(),
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

      const transactionInputs = (transaction.toHuman() as any).method.args.calls;
      console.log('transactionInputs', transactionInputs);

      // Memo: testing
      const web3 = new Web3('https://evm.shibuya.astar.network');
      const claimStakerData = web3.eth.abi.encodeFunctionCall(
        {
          name: 'claim_staker',
          type: 'function',
          inputs: [
            {
              type: 'address',
              name: 'smart_contract',
            },
          ],
        },
        ['0xde0f34d2845511c20bab0d7ce02b03c8065ff0c5'] // UniSwap in shibuya
      );

      // const claimStakerData = this.evmContract.methods
      //   .claim_staker('0xde0f34d2845511c20bab0d7ce02b03c8065ff0c5')
      //   .encodeABI();

      const calls = [
        {
          target: dappStakingContract,
          allowFailure: false,
          value: '0x0',
          callData: claimStakerData,
        },
        // {
        //   target: dappStakingContract,
        //   allowFailure: false,
        //   value: '0x0',
        //   callData: claimStakerData,
        // },
        // Add more calls as necessary
      ];
      console.log('calls', calls);
      // Todo
      await this.wallet.sendEvmTransaction({
        from: h160SenderAddress || '',
        to: multiCall3Contract,
        data: this.multiCallContract.methods.aggregate3(calls).encodeABI(),
      });
    } catch (error: any) {
      console.error(error);
      const message =
        error.message === 'dappStaking.error.invalidBalance' ? invalidBalanceMsg : error.message;
      this.eventAggregator.publish(new ExtrinsicStatusMessage({ success: false, message }));
    }
  }
}
