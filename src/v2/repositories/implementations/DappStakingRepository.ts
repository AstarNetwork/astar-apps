import { BN } from '@polkadot/util';
import { u32, Option, Struct, U32 } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { Balance, ImportedAux } from '@polkadot/types/interfaces';
import { injectable, inject } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { ApiPromise } from '@polkadot/api';
import { StakerInfo } from 'src/v2/models/DappsStaking';
import { erase } from 'highcharts';

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

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  constructor(@inject(Symbols.Api) private api: IApi) {}

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
      const eraStake = x.unwrap();
      return new StakerInfo(
        contractAddresses[index],
        eraStake.total,
        eraStake.numberOfStakers.toNumber()
      );
    });
  }

  private async getCurrentEra(api: ApiPromise): Promise<u32> {
    return await api.query.dappsStaking.currentEra<u32>();
  }

  private getAddressEnum(address: string) {
    return { Evm: address };
  }
}
