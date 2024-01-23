import {
  ExtrinsicPayload,
  GeneralStakerInfo,
  TOKEN_API_URL,
  checkIsDappRegistered,
  getDappAddressEnum,
  isValidAddressPolkadotAddress,
  wait,
} from '@astar-network/astar-sdk-core';
import { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { Option, Struct, u32 } from '@polkadot/types';
import { AccountId, Balance, EraIndex } from '@polkadot/types/interfaces';
import { Codec, ISubmittableResult } from '@polkadot/types/types';
import { BN } from '@polkadot/util';
import axios from 'axios';
import { ethers } from 'ethers';
import { inject, injectable } from 'inversify';
import { balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { checkIsDappStakingV3, checkIsLimitedProvider } from 'src/modules/dapp-staking/utils';
import { EraStakingPoints, StakeInfo } from 'src/store/dapp-staking/actions';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { Guard } from 'src/v2/common';
import { IApi } from 'src/v2/integration';
import { EventAggregator, NewEraMessage } from 'src/v2/messaging';
import {
  AccountLedger,
  DappStakingConstants,
  RewardDestination,
  SmartContract,
  SmartContractState,
  StakerInfo,
} from 'src/v2/models/DappsStaking';
import { DappAggregatedMetrics, IDappStakingRepository } from 'src/v2/repositories';
import { ParamClaimAll } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

// TODO type generation
interface EraInfo extends Struct {
  rewards: {
    stakers: Balance;
    dapps: Balance;
  };
  staked: Balance;
  locked: Balance;
}

export interface ContractStakeInfo extends Struct {
  total: BN;
  numberOfStakers: u32;
}

interface RegisteredDapp extends Struct {
  readonly developer?: AccountId;
  readonly owner?: AccountId;
  readonly state: DappState;
}

interface DappState {
  isUnregistered: boolean;
  asUnregistered: {
    // Memo: era of unregistration
    words: number[];
  };
}

interface SmartContractAddress extends Struct {
  isEvm: boolean;
  asEvm?: Codec;
  isWasm: boolean;
  asWasm?: Codec;
}

interface PalletDappsStakingAccountLedger extends Codec {
  locked: Balance;
  rewardDestination: Codec;
  unbondingInfo: UnbondingInfo;
}

interface UnbondingInfo {
  unlockingChunks: ChunkInfo[];
}

interface ChunkInfo extends Codec {
  amount: Balance;
  unlockEra: EraIndex;
  erasBeforeUnlock: number;
}

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  private static isEraSubscribed = false;
  private currentEra?: number;

  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.EventAggregator) private eventAggregator: EventAggregator
  ) {}

  public async getTvl(): Promise<string> {
    const api = await this.api.getApi();
    const era = await this.getCurrentEra();
    const result = await api.query.dappsStaking.generalEraInfo<Option<EraInfo>>(era);

    return result.unwrap().locked.toString();
  }

  public async fetchAccountStakingAmount(
    contractAddress: string,
    walletAddress: string
  ): Promise<string> {
    try {
      if (!isValidAddressPolkadotAddress(walletAddress)) return '0';
      const api = await this.api.getApi();
      const stakerInfo = await api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
        walletAddress,
        getDappAddressEnum(contractAddress)
      );
      const balance = stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked.toString();
      return String(balance);
    } catch (error) {
      return '0';
    }
  }

  public async getBondAndStakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();

    return api.tx.dappsStaking.bondAndStake(getDappAddressEnum(contractAddress), amount);
  }

  public async getUnbondAndUnstakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();

    return api.tx.dappsStaking.unbondAndUnstake(getDappAddressEnum(contractAddress), amount);
  }

  public async getNominationTransferCall({
    amount,
    fromContractId,
    targetContractId,
  }: {
    amount: BN;
    fromContractId: string;
    targetContractId: string;
  }): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    return api.tx.dappsStaking.nominationTransfer(
      getDappAddressEnum(fromContractId),
      amount,
      getDappAddressEnum(targetContractId)
    );
  }

  public async getStakerInfo(
    contractAddresses: string[],
    walletAddress: string
  ): Promise<StakerInfo[]> {
    const api = await this.api.getApi();
    const currentEra = await this.getCurrentEra();

    const eraStakes = await api.queryMulti<Option<ContractStakeInfo>[]>(
      contractAddresses.map((address) => {
        return [api.query.dappsStaking.contractEraStake, [getDappAddressEnum(address), currentEra]];
      })
    );

    const stakingAmounts = await Promise.all(
      contractAddresses.map(async (address) => {
        return {
          contractAddress: address,
          accountStakingAmount: walletAddress
            ? await this.fetchAccountStakingAmount(address, walletAddress)
            : '0',
        };
      })
    );

    return eraStakes.map((x, index) => {
      if (x.isSome) {
        const eraStake = x.unwrap();
        const accountStakingData = stakingAmounts.find(
          (it) => it.contractAddress === contractAddresses[index]
        );
        const accountStakingAmount = accountStakingData
          ? ethers.utils.formatEther(accountStakingData.accountStakingAmount)
          : '0';
        return new StakerInfo(
          contractAddresses[index],
          eraStake.total.toString(),
          eraStake.numberOfStakers.toNumber(),
          accountStakingAmount
        );
      } else {
        return new StakerInfo('-', '0', 0, '0');
      }
    });
  }

  public async getRegisteredDapps(): Promise<SmartContract[]> {
    const api = await this.api.getApi();
    const isV3 = checkIsDappStakingV3(api);
    const dapps = isV3
      ? await api.query.dappStaking.integratedDApps.entries()
      : await api.query.dappsStaking.registeredDapps.entries();
    const result: SmartContract[] = [];
    dapps.forEach(([key, value]) => {
      const v = <Option<RegisteredDapp>>value;
      const address = this.getContractAddress(key.args[0] as unknown as SmartContractAddress);
      let developer = '';
      let state = SmartContractState.Unregistered;

      if (v.isSome) {
        const unwrappedValue = v.unwrap();
        developer = String(
          isV3 ? unwrappedValue.owner?.toString() : unwrappedValue.developer?.toString()
        );
        state = unwrappedValue.state.isUnregistered
          ? SmartContractState.Unregistered
          : SmartContractState.Registered;
      }

      if (address) {
        result.push(new SmartContract(address, developer, state));
      }
    });

    return result;
  }

  public async getRegisteredContract(developerAddress: string): Promise<string | undefined> {
    try {
      const api = await this.api.getApi();
      const account = api.registry.createType('AccountId32', developerAddress.toString());
      const contractAddress = await api.query.dappsStaking.registeredDevelopers<
        Option<SmartContractAddress>
      >(account);
      return contractAddress.isNone ? undefined : this.getContractAddress(contractAddress.unwrap());
    } catch (error) {
      return undefined;
    }
  }

  public async starEraSubscription(): Promise<void> {
    // Avoid multiple subscriptions.
    if (!DappStakingRepository.isEraSubscribed) {
      DappStakingRepository.isEraSubscribed = true;
      const api = await this.api.getApi();
      if (checkIsDappStakingV3(api)) {
        return;
      }

      await api.query.dappsStaking.currentEra((era: u32) => {
        // For some reason subscription is triggered for every produced block,
        // so that's why logic below.
        const newEra = era.toNumber();
        if (!this.currentEra || this.currentEra !== newEra) {
          this.eventAggregator.publish(new NewEraMessage(era.toNumber()));
          this.currentEra = newEra;
        }
      });
    }
  }

  public async getDapp(
    contractAddress: string,
    network: string,
    forEdit = false
  ): Promise<EditDappItem | undefined> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('network', network);

    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dapps/${contractAddress}?forEdit=${forEdit}`;

    try {
      const response = await axios.get<EditDappItem>(url);
      return response.data;
    } catch {
      return undefined;
    }
  }

  public async getLedger(accountAddress: string): Promise<AccountLedger> {
    const api = await this.api.getApi();
    const ledger = await api.query.dappsStaking.ledger<PalletDappsStakingAccountLedger>(
      accountAddress
    );

    return {
      locked: ledger.locked.toBn(),
      rewardDestination: <RewardDestination>ledger.rewardDestination.toString(),
      unbondingInfo: {
        unlockingChunks: ledger.unbondingInfo.unlockingChunks.map((x) => {
          return {
            amount: x.amount.toBn(),
            unlockEra: x.unlockEra.toBn(),
            erasBeforeUnlock: x.erasBeforeUnlock,
          };
        }),
      },
    };
  }

  public async getConstants(): Promise<DappStakingConstants> {
    const api = await this.api.getApi();
    const maxEraStakeValues = Number(api.consts.dappsStaking.maxEraStakeValues.toString());

    return {
      maxEraStakeValues,
    };
  }

  public async getGeneralStakerInfo(
    stakerAddress: string,
    contractAddress: string
  ): Promise<Map<string, GeneralStakerInfo>> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('stakerAddress', stakerAddress);

    const result = new Map<string, GeneralStakerInfo>();
    const api = await this.api.getApi();
    const stakerInfos = await api.query.dappsStaking.generalStakerInfo.entries(stakerAddress);
    stakerInfos.forEach(([key, stakerInfo]) => {
      const contractAddress = key.args[1].toString();
      const info = stakerInfo.toHuman() as unknown as GeneralStakerInfo;
      result.set(contractAddress, info);
    });

    return result;
  }

  public async getApr(network: string): Promise<{ apr: number; apy: number }> {
    Guard.ThrowIfUndefined('network', network);

    const baseUrl = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking`;
    const [apr, apy] = await Promise.all([
      (await axios.get<number>(`${baseUrl}/apr`)).data,
      (await axios.get<number>(`${baseUrl}/apy`)).data,
    ]);

    return { apr, apy };
  }

  public async getCurrentEra(): Promise<u32> {
    const api = await this.api.getApi();

    return (await api.query.dappsStaking?.currentEra<u32>()) ?? 0;
  }

  public async getNextEraEta(network: string): Promise<number> {
    Guard.ThrowIfUndefined('network', network);

    const baseUrl = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/stats/nexteraeta`;
    const result = await axios.get<number>(baseUrl);

    return result.data;
  }

  private getContractAddress(address: SmartContractAddress): string | undefined {
    if (address.isEvm) {
      return address?.asEvm?.toString();
    } else if (address.isWasm) {
      return address?.asWasm?.toString();
    } else {
      return undefined;
    }
  }

  public async getStakeInfo(
    dappAddress: string,
    currentAccount: string
  ): Promise<StakeInfo | undefined> {
    const api = await this.api.getApi();
    const stakeInfo = new Promise<StakeInfo | undefined>(async (resolve) => {
      const data = await this.handleGetStakeInfo({ api, dappAddress, currentAccount });
      resolve(data);
    });
    const fallbackTimeout = new Promise<string>(async (resolve) => {
      const timeout = 4 * 1000;
      await wait(timeout);
      resolve('timeout');
    });

    const race = Promise.race<StakeInfo | undefined | string>([stakeInfo, fallbackTimeout]);
    const result = race.then((res) => {
      if (res === 'timeout') {
        return undefined;
      } else {
        return res as StakeInfo;
      }
    });
    return result;
  }

  public async getAggregatedMetrics(network: string): Promise<DappAggregatedMetrics[]> {
    Guard.ThrowIfUndefined('network', network);

    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/stats/aggregated?period=30d`;

    try {
      const response = await axios.get<DappAggregatedMetrics[]>(url);
      return response.data;
    } catch {
      return [];
    }
  }

  private async handleGetStakeInfo({
    api,
    dappAddress,
    currentAccount,
  }: {
    api: ApiPromise;
    dappAddress: string;
    currentAccount: string;
  }): Promise<StakeInfo | undefined> {
    const initialYourStake = {
      formatted: '',
      denomAmount: new BN('0'),
    };

    const stakeInfo = await this.getLatestStakePoint(api, dappAddress);
    if (!stakeInfo) return undefined;

    const data = {
      totalStake: balanceFormatter(stakeInfo.total.toString()),
      yourStake: initialYourStake,
      claimedRewards: '0',
      hasStake: false,
      stakersCount: Number(stakeInfo.numberOfStakers.toString()),
      dappAddress,
      isRegistered: true,
    };

    try {
      const [stakerInfo, { isRegistered }] = await Promise.all([
        api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
          currentAccount,
          getDappAddressEnum(dappAddress)
        ),
        checkIsDappRegistered({ dappAddress, api }),
      ]);

      const balance = stakerInfo.stakes.length && stakerInfo.stakes.slice(-1)[0].staked.toString();
      const yourStake = balance
        ? {
            formatted: balanceFormatter(balance),
            denomAmount: new BN(balance.toString()),
          }
        : initialYourStake;

      return {
        ...data,
        hasStake: Number(balance.toString()) > 0,
        yourStake,
        isRegistered,
      };
    } catch (error) {
      return data;
    }
  }

  private async getLatestStakePoint(
    api: ApiPromise,
    contract: string
  ): Promise<EraStakingPoints | undefined> {
    if (!contract) {
      return undefined;
    }
    const currentEra = await (await api.query.dappsStaking.currentEra<EraIndex>()).toNumber();
    const contractAddress = getDappAddressEnum(contract);
    // iterate from currentEra backwards until you find record for ContractEraStake
    for (let era = currentEra; era > 0; era -= 1) {
      // Memo: wait for avoiding provider limitation
      checkIsLimitedProvider() && (await wait(200));
      const stakeInfoPromise = await api.query.dappsStaking.contractEraStake<
        Option<EraStakingPoints>
      >(contractAddress, era);
      const stakeInfo = stakeInfoPromise.unwrapOr(undefined);
      if (stakeInfo) {
        return stakeInfo;
      }
    }

    return undefined;
  }

  public async getSetRewardDestinationCall(
    rewardDestination: RewardDestination
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    return api.tx.dappsStaking.setRewardDestination(rewardDestination);
  }

  public async getWithdrawCall(): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    return api.tx.dappsStaking.withdrawUnbonded();
  }

  public async getClaimCall({
    batchTxs,
    maxBatchWeight,
    senderAddress,
    transferableBalance,
  }: ParamClaimAll): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();

    if (0 >= batchTxs.length) {
      throw Error('No dApps can be claimed');
    }

    const txsToExecute: ExtrinsicPayload[] = [];
    let totalWeight: BN = new BN('0');
    for (let i = 0; i < batchTxs.length; i++) {
      const tx = batchTxs[i];
      const weight = tx.isWeightV2 ? tx.asWeightV2().refTime.toBn() : tx.asWeightV1();
      if (totalWeight.add(weight).gt(maxBatchWeight)) {
        break;
      }

      txsToExecute.push(tx.payload as ExtrinsicPayload);
      totalWeight = totalWeight.add(weight);
    }

    console.info(
      `Batch weight: ${totalWeight.toString()}, transactions no. ${txsToExecute.length}`
    );
    const transaction = api.tx.utility.batch(txsToExecute);

    const info = await api.tx.utility.batch(txsToExecute).paymentInfo(senderAddress);
    const partialFee = info.partialFee.toBn();
    const balance = new BN(ethers.utils.parseEther(transferableBalance.toString()).toString());

    if (balance.sub(partialFee.muln(1.5)).isNeg()) {
      throw Error('dappStaking.error.invalidBalance');
    }
    return transaction;
  }
}
