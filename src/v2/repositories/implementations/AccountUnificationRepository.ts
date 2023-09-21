import { inject, injectable } from 'inversify';
import {
  IAccountUnificationRepository,
  IAccountsRepository,
  IIdentityRepository,
} from 'src/v2/repositories';
import { ExtrinsicPayload, IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';
import { IdentityData } from 'src/v2/models';

@injectable()
export class AccountUnificationRepository implements IAccountUnificationRepository {
  constructor(
    @inject(Symbols.AccountsRepository) private accountsRepository: IAccountsRepository,
    @inject(Symbols.IdentityRepository) private identityRepository: IIdentityRepository,
    @inject(Symbols.DefaultApi) private readonly api: IApi
  ) {}

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
    const unifyCall = await this.accountsRepository.getClaimEvmAccountCall(evmAddress, signature);

    return api.tx.utility.batchAll([identityCall, unifyCall]);
  }
}
