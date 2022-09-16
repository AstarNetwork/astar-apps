import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { XcmChain } from 'src/modules/xcm';
export interface IXcmService extends IXcmTransfer {
  getAssets(currentAccount: string, isFetchUsd: boolean): Promise<XcmAssets>;
}

export interface TransferParam {
  from: XcmChain;
  to: XcmChain;
  token: Asset;
  senderAddress: string;
  recipientAddress: string;
  amount: number;
  finalizedCallback?: (hash: string) => Promise<void>;
}

export interface IXcmTransfer {
  transfer({
    from,
    to,
    token,
    senderAddress,
    recipientAddress,
    amount,
    finalizedCallback,
  }: TransferParam): Promise<void>;
}
