import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { inject, injectable } from 'inversify';
import { IApi } from 'src/v2/integration';
import { NativeTokenTransferParam } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';
import { ITokenTransferRepository } from './../ITokenTransferRepository';

@injectable()
export class TokenTransferRepository implements ITokenTransferRepository {
  constructor(@inject(Symbols.DefaultApi) protected api: IApi) {}

  public async getTransferNativeTokenCall({
    receivingAddress,
    amount,
  }: NativeTokenTransferParam): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    const api = await this.api.getApi();
    return api.tx.balances.transfer(receivingAddress, amount);
  }
}
