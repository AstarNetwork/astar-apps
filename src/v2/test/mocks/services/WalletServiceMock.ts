import { injectable } from 'inversify';
import { IWalletService, ParamSignAndSend } from 'src/v2/services';

@injectable()
export class WalletServiceMock implements IWalletService {
  constructor() {
    this.walletSignAndSendMock.mockReset();
  }

  public readonly walletSignAndSendMock = jest.fn();

  public async signAndSend({
    extrinsic,
    senderAddress,
    successMessage,
  }: ParamSignAndSend): Promise<string | null> {
    return this.walletSignAndSendMock.call(this, extrinsic, senderAddress, successMessage);
  }
}
