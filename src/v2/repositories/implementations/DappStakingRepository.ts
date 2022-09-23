import { BN } from '@polkadot/util';
import { u32, Option, Struct, U32 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { AccountId, Balance, ImportedAux } from '@polkadot/types/interfaces';
import { injectable, inject } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { ApiPromise } from '@polkadot/api';
import { SmartContract, SmartContractState, StakerInfo } from 'src/v2/models/DappsStaking';
import { EventAggregator, NewEraMessage } from 'src/v2/messaging';

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

  public async getBondAndStakeCall(
    contractAddress: string,
    amount: BN
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();

    return api.tx.dappsStaking.bondAndStake(this.getAddressEnum(contractAddress), amount);
  }

  public async getStakerInfo(contractAddresses: string[]): Promise<StakerInfo[]> {
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

    return eraStakes.map((x, index) => {
      if (x.isSome) {
        const eraStake = x.unwrap();
        return new StakerInfo(
          contractAddresses[index],
          eraStake.total,
          eraStake.numberOfStakers.toNumber()
        );
      } else {
        return new StakerInfo('-', new BN(0), 0);
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

  public async starEraSubscription(): Promise<void> {
    // Avoid multiple subscriptions.
    if (!DappStakingRepository.isEraSubscribed) {
      const api = await this.api.getApi();
      await api.query.dappsStaking.currentEra((era: u32) => {
        console.log(era.toString());
        this.eventAggregator.publish(new NewEraMessage(era.toNumber()));
      });
      DappStakingRepository.isEraSubscribed = true;
    }
  }

  private async getCurrentEra(api: ApiPromise): Promise<u32> {
    return await api.query.dappsStaking.currentEra<u32>();
  }

  private getAddressEnum(address: string) {
    return { Evm: address };
  }
}
