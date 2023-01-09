import { ISubmittableResult } from '@polkadot/types/types';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { injectable } from 'inversify';
import { IWalletService } from 'src/v2/services';
import { SubstrateAccount } from 'src/store/general/state';
import { HistoryTxType } from 'src/modules/account';

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

  public async signAndSendWithCustomSignature({
    transaction,
    senderAddress,
    substrateAccounts,
    isCustomSignature = false,
    txResHandler,
    handleCustomExtrinsic,
    tip,
    txType,
  }: {
    transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
    senderAddress: string;
    substrateAccounts: SubstrateAccount[];
    isCustomSignature: boolean;
    txResHandler: (result: ISubmittableResult) => Promise<boolean>;
    // from: useCustomSignature.ts
    handleCustomExtrinsic?: (
      method: SubmittableExtrinsic<'promise', ISubmittableResult>
    ) => Promise<void>;
    tip?: string;
    txType?: HistoryTxType;
  }): Promise<boolean> {
    return this.walletSignAndSendMock.call(this, transaction, senderAddress, '');
  }
}
