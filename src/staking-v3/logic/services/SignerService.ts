import { ExtrinsicPayload } from '@astar-network/astar-sdk-core';
import { injectable, inject } from 'inversify';
import { IWalletService } from 'src/v2/services';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class SignerService {
  constructor(@inject(Symbols.WalletFactory) private walletFactory: () => IWalletService) {}

  public async signCall(
    call: ExtrinsicPayload,
    senderAddress: string,
    successMessage: string
  ): Promise<void> {
    const wallet = this.walletFactory();
    await wallet.signAndSend({
      extrinsic: call,
      senderAddress: senderAddress,
      successMessage,
    });
  }
}
