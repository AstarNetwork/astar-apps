import { inject, injectable } from 'inversify';
import '@polkadot/api-augment';
import type { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import { Guard } from 'src/v2/common';
import { IApi } from 'src/v2/integration';
import { AccountDataModel, AccountInfoModel } from 'src/v2/models';
import { ISystemRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class SystemRepository implements ISystemRepository {
  constructor(@inject(Symbols.DefaultApi) private api: IApi) {}

  public async getAccountInfo(address: string): Promise<AccountInfoModel> {
    Guard.ThrowIfUndefined('address', address);

    const api = await this.api.getApi();
    const accountInfo = await api.query.system.account<FrameSystemAccountInfo>(address);

    return new AccountInfoModel(
      accountInfo.nonce.toBn(),
      new AccountDataModel(
        accountInfo.data.free.toBn(),
        accountInfo.data.reserved.toBn(),
        accountInfo.data.miscFrozen.toBn(),
        accountInfo.data.feeFrozen.toBn()
      )
    );
  }
}
