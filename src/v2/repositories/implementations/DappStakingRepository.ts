import { BN } from '@polkadot/util';
import { u32, Option, Struct } from '@polkadot/types';
import { Codec, ISubmittableResult } from '@polkadot/types/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import { Balance, EraIndex } from '@polkadot/types/interfaces';
import { injectable, inject } from 'inversify';
import { IDappStakingRepository } from 'src/v2/repositories';
import { IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { AccountLedger } from 'src/v2/models/DappsStaking';

// TODO type generation
interface EraInfo extends Struct {
  rewards: {
    stakers: Balance;
    dapps: Balance;
  };
  staked: Balance;
  locked: Balance;
}

interface PalletDappsStakingAccountLedger extends Codec {
  locked: Balance;
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

  public async getLedger(accountAddress: string): Promise<AccountLedger> {
    const api = await this.api.getApi();
    const ledger = await api.query.dappsStaking.ledger<PalletDappsStakingAccountLedger>(
      accountAddress
    );

    return {
      locked: ledger.locked.toBn(),
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

  private getAddressEnum(address: string) {
    return { Evm: address };
  }
}
