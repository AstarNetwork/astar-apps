import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

export enum WalletType {
  Metamask = 'Metamask',
  Polkadot = 'Polkadot',
}

export interface ParamSignAndSend {
  extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>;
  senderAddress: string;
  successMessage?: string;
  transactionTip?: number;
  finalizedCallback?: (result?: ISubmittableResult) => void;
  subscan?: string;
}

export interface ParamSendMultisigTransaction {
  extrinsic: SubmittableExtrinsic<'promise', ISubmittableResult>;
  multisig: string;
  senderAddress: string;
  tip: string;
}

export interface IWalletService {
  /**
   * Signs and sends transaction. Returns transaction hash.
   * @param extrinsic Extrisnic to sign and send
   * @param senderAddress Signer address
   * @param successMessage Message to show in case of successful transaction
   * @param transactionTip Transaction tip.
   */
  signAndSend(param: ParamSignAndSend): Promise<string | null>;
}
