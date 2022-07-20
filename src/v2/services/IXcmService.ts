import { Asset } from 'src/v2/models';
import { Network } from '../config/types';

export interface IXcmService extends IXcmTransfer {
  getAssets(currentAccount: string): Promise<Asset[]>;
}

export interface IXcmTransfer {
  transfer(
    from: Network,
    to: Network,
    token: Asset,
    senderAddress: string,
    recipientAddress: string,
    amount: number
  ): Promise<void>;
}
