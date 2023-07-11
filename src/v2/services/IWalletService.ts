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

export interface ParamSendEvmTransaction {
  from: string;
  to: string;
  data: any;
  value?: string;
  successMessage?: string;
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
  /**
   * Signs and sends EVM transaction. Returns transaction hash.
   * @param from sender address
   * @param to contract or destination address
   * @param data encoded contract methods
   * @param value amount value of ASTR tokens (default value: '0x0')
   * @param successMessage Message to show in case of successful transaction
   */
  sendEvmTransaction(param: ParamSendEvmTransaction): Promise<string>;
}
