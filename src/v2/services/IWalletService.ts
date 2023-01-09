import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { SubstrateAccount } from 'src/store/general/state';
import { HistoryTxType } from 'src/modules/account';

export enum WalletType {
  Metamask = 'Metamask',
  Polkadot = 'Polkadot',
}

export interface IWalletService {
  /**
   * Signs and sends transaction. Returns transaction hash.
   * @param extrinsic Extrisnic to sign and send
   * @param senderAddress Signer address
   * @param successMessage Message to show in case of sucessfull transaction
   * @param transactionTip Transation tip.
   */
  signAndSend(
    extrinsic: SubmittableExtrinsic<'promise'>,
    senderAddress: string,
    successMessage?: string,
    transactionTip?: number
  ): Promise<string | null>;

  signAndSendWithCustomSignature({
    transaction,
    senderAddress,
    substrateAccounts,
    isCustomSignature,
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
  }): Promise<boolean>;
}
