import { AccountId32, H160 } from '@polkadot/types/interfaces';
import { inject, injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { IdentityData } from 'src/v2/models';
import { IAccountUnificationRepository, IIdentityRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class AccountUnificationRepository implements IAccountUnificationRepository {
  constructor(
    @inject(Symbols.IdentityRepository) private identityRepository: IIdentityRepository,
    @inject(Symbols.DefaultApi) private readonly api: IApi
  ) {}

  public async getClaimEvmAccountCall(
    evmAddress: string,
    signature: string
  ): Promise<ExtrinsicPayload> {
    Guard.ThrowIfUndefined('h160Address', evmAddress);
    Guard.ThrowIfUndefined('signature', signature);

    const api = await this.api.getApi();

    return api.tx.unifiedAccounts.claimEvmAddress(evmAddress, signature);
  }

  public async getMappedNativeAddress(evmAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('evmAddress', evmAddress);

    const api = await this.api.getApi();
    // Todo: update the function name once Shibuya runtime has been updated.
    const nativeAddress = api.query.hasOwnProperty('unifiedAccounts')
      ? await api.query.unifiedAccounts.evmToNative<AccountId32>(evmAddress)
      : '';

    return nativeAddress.toString();
  }

  public async getMappedEvmAddress(nativeAddress: string): Promise<string> {
    Guard.ThrowIfUndefined('nativeAddress', nativeAddress);

    const api = await this.api.getApi();
    // Todo: update the function name once Shibuya runtime has been updated.
    const evmAddress = api.query.hasOwnProperty('unifiedAccounts')
      ? await api.query.unifiedAccounts.nativeToEvm<H160>(nativeAddress)
      : '';

    return evmAddress.toString();
  }

  public async getUnifyAccountsBatchAllCall(
    nativeAddress: string,
    evmAddress: string,
    signature: string,
    identityInfo: IdentityData
  ): Promise<ExtrinsicPayload> {
    const api = await this.api.getApi();

    const identityCall = await this.identityRepository.getSetIdentityCall(
      nativeAddress,
      identityInfo
    );
    const unifyCall = await this.getClaimEvmAccountCall(evmAddress, signature);

    return api.tx.utility.batchAll([identityCall, unifyCall]);
  }
}
