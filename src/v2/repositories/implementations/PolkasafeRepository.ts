import { injectable } from 'inversify';
import { Guard, container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { IPolkasafeRepository, MultisigTransactionParam } from 'src/v2/repositories';
import { BN } from '@polkadot/util';
import { PolkasafeWrapper } from 'src/types/polkasafe';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
@injectable()
export class PolkasafeRepository implements IPolkasafeRepository {
  constructor() {}

  public getAddress(): string {
    const polkasafeClient = container.get<PolkasafeWrapper>(Symbols.PolkasafeClient);
    return polkasafeClient.getAddress();
  }

  public async getMultisigTransaction({
    multisigAddress,
    api,
    transaction,
    proxyAddress,
  }: MultisigTransactionParam): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    Guard.ThrowIfUndefined('multisigAddress', multisigAddress);
    Guard.ThrowIfUndefined('transaction', transaction);

    const polkasafeClient = container.get<PolkasafeWrapper>(Symbols.PolkasafeClient);
    const data = await polkasafeClient.signCustomTx({
      api,
      multisigAddress,
      tx: transaction,
      proxyAddress,
    });
    if (data.error || !data.transaction) {
      console.error('error', data.error);
      throw Error(data.error || 'not able to create transaction');
    }
    console.log('data', data);
    return data.transaction;
  }
}
