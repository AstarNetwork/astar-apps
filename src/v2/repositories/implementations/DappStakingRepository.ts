import { BN } from '@polkadot/util';
import { u32, Option, Struct } from '@polkadot/types';
import { Balance } from '@polkadot/types/interfaces';
import { injectable, inject } from 'inversify-props';
import { Guard } from 'src/v2/common';
import { IDappStakingRepository } from 'src/v2/repositories';
import { IApi } from 'src/v2/integration';

// TODO type generation
interface EraInfo extends Struct {
  rewards: {
    stakers: Balance;
    dapps: Balance;
  };
  staked: Balance;
  locked: Balance;
}

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  constructor(@inject() private api: IApi) {
    Guard.ThrowIfUndefined('api', api);
  }

  public async getTvl(): Promise<BN> {
    const api = await this.api.getApi();
    const era = await api.query.dappsStaking.currentEra<u32>();
    const result = await api.query.dappsStaking.generalEraInfo<Option<EraInfo>>(era);

    return result.unwrap().locked.toBn();
  }
}
