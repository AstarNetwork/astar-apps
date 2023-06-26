import { injectable } from 'inversify';
import { Guard, container } from 'src/v2/common';
import { Symbols } from 'src/v2/symbols';
import { Polkasafe } from 'polkasafe';
import { IPolkasafeRepository, MultisigTransactionParam } from 'src/v2/repositories';

@injectable()
export class PolkasafeRepository implements IPolkasafeRepository {
  constructor() {}

  public async sendMultisigTransaction({
    multisigAddress,
    transaction,
  }: MultisigTransactionParam): Promise<string> {
    Guard.ThrowIfUndefined('multisigAddress', multisigAddress);
    Guard.ThrowIfUndefined('transaction', transaction);
    const eventGrabber = (message: any): void => {
      // Memo: use message to track transaction progress and events using eventGrabber for real-time visibility
      // console.info(message);
    };
    const isProxy = false;
    const polkasafeClient = container.get<Polkasafe>(Symbols.PolkasafeClient);
    const { data, error } = await polkasafeClient.transferAsMulti(
      multisigAddress,
      transaction,
      eventGrabber,
      isProxy
    );
    if (error) {
      throw Error(error);
    }
    return data.callHash;
  }
}
