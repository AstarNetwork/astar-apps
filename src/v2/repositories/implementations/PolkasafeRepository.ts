import { injectable } from 'inversify';
import { Guard, container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { Polkasafe } from 'polkasafe';
import { IPolkasafeRepository, MultisigTransactionParam } from 'src/v2/repositories';
import { BN } from '@polkadot/util';
@injectable()
export class PolkasafeRepository implements IPolkasafeRepository {
  constructor() {}

  public async sendMultisigTransaction({
    multisigAddress,
    transaction,
    tip,
    isProxyAccount,
  }: MultisigTransactionParam): Promise<string> {
    Guard.ThrowIfUndefined('multisigAddress', multisigAddress);
    Guard.ThrowIfUndefined('transaction', transaction);

    const polkasafeClient = container.get<Polkasafe>(Symbols.PolkasafeClient);
    const { data, error } = await polkasafeClient.customTransactionAsMulti(
      multisigAddress,
      transaction,
      undefined,
      isProxyAccount,
      new BN(tip)
    );
    if (error) {
      console.error('error', error);
      throw Error(error.error);
    }
    return data.callHash;
  }
}
