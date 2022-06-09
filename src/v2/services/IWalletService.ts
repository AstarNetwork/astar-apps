import { SubmittableExtrinsic } from '@polkadot/api/types';

export enum WalletType {
  Metamask = 'Metamask',
  Polkadot = 'Polkadot',
}

export interface IWalletService {
  signAndSend(
    extrinsic: SubmittableExtrinsic<'promise'>,
    senderAddress: string,
    tip?: string,
    successMessage?: string
  ): Promise<void>;
}
