import { ISubmittableResult } from '@polkadot/types/types';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { injectable } from 'inversify';
import { IWalletService } from 'src/v2/services';

@injectable()
export class WalletServiceMock implements IWalletService {
  constructor() {
    this.walletSignAndSendMock.mockReset();
  }

  public readonly walletSignAndSendMock = jest.fn();

  public async signAndSend(
    extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>,
    senderAddress: string,
    successMessage?: string
  ): Promise<string | null> {
    return this.walletSignAndSendMock.call(this, extrinsic, senderAddress, successMessage);
  }
}
