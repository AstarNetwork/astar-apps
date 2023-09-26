import { inject, injectable } from 'inversify';
import { IAccountsRepository } from 'src/v2/repositories';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { Guard } from 'src/v2/common';
import { AccountId32, H160 } from '@polkadot/types/interfaces';

@injectable()
export class AccountsRepository implements IAccountsRepository {
  constructor(@inject(Symbols.DefaultApi) private api: IApi) {}

  public async getClaimEvmAccountCall(
    evmAddress: string,
    signature: string
  ): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined('h160Address', evmAddress);
    Guard.ThrowIfUndefined('signature', signature);

    const api = await this.api.getApi();

    return api.tx.unifiedAccounts.claimEvmAccount(evmAddress, signature);
  }

  public async getMappedNativeAddress(evmAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('evmAddress', evmAddress);

    const api = await this.api.getApi();
    const nativeAddress = await api.query.unifiedAccounts.nativeToEvm<AccountId32>(evmAddress);

    return nativeAddress.toString();
  }

  public async getMappedEvmAddress(nativeAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('nativeAddress', nativeAddress);

    const api = await this.api.getApi();
    const evmAddress = await api.query.unifiedAccounts.evmToNative<H160>(nativeAddress);

    return evmAddress.toString();
  }
}
