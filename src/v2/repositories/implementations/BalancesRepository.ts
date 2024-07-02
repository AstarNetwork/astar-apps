import { inject, injectable } from 'inversify';
import { IBalancesRepository } from '../IBalancesRepository';
import { Symbols } from 'src/v2/symbols';
import { IApi } from 'src/v2/integration';

@injectable()
export class BalancesRepository implements IBalancesRepository {
  constructor(@inject(Symbols.DefaultApi) private readonly api: IApi) {}

  public async getTotalIssuance(blockNumber?: number): Promise<bigint> {
    const api = await this.api.getApi(blockNumber);
    const issuance = await api.query.balances.totalIssuance();

    return issuance.toBigInt();
  }
}
