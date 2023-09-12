import { inject, injectable } from 'inversify';
import { IAccountsRepository } from 'src/v2/repositories';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { Guard } from 'src/v2/common';

@injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(@inject(Symbols.DefaultApi) private api: IApi) {}

  public async getClaimEvmAccountCall(
    h160Address: string,
    signature: number[]
  ): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined('h160Address', h160Address);
    Guard.ThrowIfUndefined('signature', signature);

    const api = await this.api.getApi();

    return api.tx.accounts.claimEvmAccount(h160Address, signature);
  }
}
