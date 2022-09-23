import { BN } from '@polkadot/util';
import { u32, Option, Struct } from '@polkadot/types';
import { ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import { injectable, inject } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { IApi } from 'src/v2/integration';
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

@injectable()
export class DappStakingRepository implements IDappStakingRepository {
  constructor(@inject(Symbols.DefaultApi) private api: IApi) {}

  public async getTvl(): Promise<BN> {
    const api = await this.api.getApi();
    const era = await api.query.dappsStaking.currentEra<u32>();
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

  private getAddressEnum(address: string) {
    return { Evm: address };
  }
}
