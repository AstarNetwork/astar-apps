import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';
import { BN } from '@polkadot/util';
import { u32, Option, Struct } from '@polkadot/types';
import { Codec, ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { AccountId, Balance } from '@polkadot/types/interfaces';
import { injectable, inject } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { ApiPromise } from '@polkadot/api';
import { SmartContract, SmartContractState, StakerInfo } from 'src/v2/models/DappsStaking';
import { EventAggregator, NewEraMessage } from 'src/v2/messaging';
import { GeneralStakerInfo } from 'src/hooks/helper/claim';
import { ethers } from 'ethers';
import { EditDappItem } from 'src/store/dapp-staking/state';
import { Guard } from 'src/v2/common';
import { TOKEN_API_URL } from 'src/modules/token-api';
import axios from 'axios';

// TODO type generation
interface EraInfo extends Struct {
  rewards: {
    stakers: Balance;
    dapps: Balance;
  };
  staked: Balance;
  locked: Balance;
}

interface ContractStakeInfo extends Struct {
  total: BN;
  numberOfStakers: u32;
}

interface RegisteredDapp extends Struct {
  readonly developer: AccountId;
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

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  private static isEraSubscribed = false;

  constructor(
    @inject(Symbols.DefaultApi) private api: IApi,
    @inject(Symbols.EventAggregator) private eventAggregator: EventAggregator
  ) {}

  public async getTvl(): Promise<BN> {
    const api = await this.api.getApi();
    const era = await this.getCurrentEra(api);
    const result = await api.query.dappsStaking.generalEraInfo<Option<EraInfo>>(era);

    return result.unwrap().locked.toBn();
  }

  public async fetchAccountStakingAmount(
    contractAddress: string,
    walletAddress: string
  ): Promise<string> {
    try {
      if (isValidAddressPolkadotAddress(walletAddress)) return '0';
      const api = await this.api.getApi();
      const stakerInfo = await api.query.dappsStaking.generalStakerInfo<GeneralStakerInfo>(
        walletAddress,
        {
          Evm: contractAddress,
        }
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

    return api.tx.dappsStaking.bondAndStake(this.getAddressEnum(contractAddress), amount);
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
      this.getAddressEnum(fromContractId),
      amount,
      this.getAddressEnum(targetContractId)
    );
  }

  public async getStakerInfo(
    contractAddresses: string[],
    walletAddress: string
  ): Promise<StakerInfo[]> {
    const api = await this.api.getApi();
    const currentEra = await this.getCurrentEra(api);

    const eraStakes = await api.queryMulti<Option<ContractStakeInfo>[]>(
      contractAddresses.map((address) => {
        return [
          api.query.dappsStaking.contractEraStake,
          [this.getAddressEnum(address), currentEra],
        ];
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
          eraStake.total,
          eraStake.numberOfStakers.toNumber(),
          accountStakingAmount
        );
      } else {
        return new StakerInfo('-', new BN(0), 0, '0');
      }
    });
  }

  public async getRegisteredDapps(): Promise<SmartContract[]> {
    const api = await this.api.getApi();
    const dapps = await api.query.dappsStaking.registeredDapps.entries();

    const result: SmartContract[] = [];
    dapps.forEach(([key, value]) => {
      const v = <Option<RegisteredDapp>>value;
      const address = JSON.parse(key.args.map((x) => x.toString())[0]).evm; // TODO This is kinda suck. See how it can do it better.
      let developer = '';
      let state = SmartContractState.Unregistered;

      if (v.isSome) {
        const unwrappedValue = v.unwrap();
        developer = unwrappedValue.developer.toString();
        state = unwrappedValue.state.isUnregistered
          ? SmartContractState.Unregistered
          : SmartContractState.Registered;
      }

      result.push(new SmartContract(address, developer, state));
    });

    return result;
  }

  public async getRegisteredContract(developerAddress: string): Promise<string | undefined> {
    const api = await this.api.getApi();
    const account = api.registry.createType('AccountId32', developerAddress.toString());
    const contractAddress = await api.query.dappsStaking.registeredDevelopers<
      Option<SmartContractAddress>
    >(account);

    return contractAddress.isNone ? undefined : this.getContractAddress(contractAddress.unwrap());
  }

  public async starEraSubscription(): Promise<void> {
    // Avoid multiple subscriptions.
    if (!DappStakingRepository.isEraSubscribed) {
      const api = await this.api.getApi();
      await api.query.dappsStaking.currentEra((era: u32) => {
        console.log('New era: ', era.toString());
        this.eventAggregator.publish(new NewEraMessage(era.toNumber()));
      });
      DappStakingRepository.isEraSubscribed = true;
    }
  }

  public async getDapp(
    contractAddress: string,
    network: string
  ): Promise<EditDappItem | undefined> {
    Guard.ThrowIfUndefined('contractAddress', contractAddress);
    Guard.ThrowIfUndefined('network', network);

    const url = `${TOKEN_API_URL}/v1/${network.toLowerCase()}/dapps-staking/dapps/${contractAddress}`;
    const response = await axios.get<EditDappItem>(url);

    return response.data;
  }

  private async getCurrentEra(api: ApiPromise): Promise<u32> {
    return await api.query.dappsStaking.currentEra<u32>();
  }

  private getAddressEnum(address: string) {
    return { Evm: address };
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
}
