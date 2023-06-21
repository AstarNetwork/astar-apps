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
  }: MultisigTransactionParam): Promise<any> {
    Guard.ThrowIfUndefined('multisigAddress', multisigAddress);
    Guard.ThrowIfUndefined('transaction', transaction);
    try {
      const eventGrabber = (message: any) => {
        // use message to track transaction progress and events using eventGrabber for real-time visibility
        console.log(message);
      };
      const isProxy = false;
      const polkasafeClient = container.get<Polkasafe>(Symbols.PolkasafeClient);
      const { data, error } = await polkasafeClient.transferAsMulti(
        multisigAddress,
        transaction,
        eventGrabber,
        isProxy
      );

      if (data) {
        console.log(data);
        // use your data
      } else if (error) {
        console.log(error);
      }
      return 'data';
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
